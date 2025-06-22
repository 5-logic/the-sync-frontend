'use client';

import {
	CloudUploadOutlined,
	DeleteOutlined,
	DownloadOutlined,
} from '@ant-design/icons';
import {
	Alert,
	Button,
	Card,
	Col,
	Form,
	Input,
	Row,
	Select,
	Space,
	Table,
	Tag,
	Tooltip,
	Typography,
	Upload,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { RcFile } from 'antd/es/upload';
import { useEffect, useState } from 'react';

import { FormLabel } from '@/components/common/FormLabel';
import { showNotification } from '@/lib/utils/notification';
import { SemesterStatus } from '@/schemas/_enums';
import { useMajorStore } from '@/store/useMajorStore';
import { useSemesterStore } from '@/store/useSemesterStore';

const { Dragger } = Upload;

// Import status tags from SemesterTable or create shared constants
const STATUS_TAG: Record<SemesterStatus, JSX.Element> = {
	NotYet: <Tag color="blue">Not Yet</Tag>,
	Preparing: <Tag color="orange">Preparing</Tag>,
	Picking: <Tag color="purple">Picking</Tag>,
	Ongoing: <Tag color="green">Ongoing</Tag>,
	End: <Tag color="gray">End</Tag>,
};

type ExcelImportFormProps<T extends { id: string }> = Readonly<{
	note: string;
	fields: {
		title: string;
		key: keyof T;
		type: 'text' | 'select';
		options?: { label: string; value: string }[];
	}[];
	mockData: T[];
	onImport: (data: T[], semesterId?: string, majorId?: string) => void;
	templateFileName?: string; // Template file name in public/files folder
	requireSemester?: boolean; // Whether semester selection is required
	requireMajor?: boolean; // Whether major selection is required
}>;

export default function ExcelImportForm<T extends { id: string }>({
	note,
	fields,
	mockData,
	onImport,
	templateFileName,
	requireSemester = false,
	requireMajor = false,
}: ExcelImportFormProps<T>) {
	const [form] = Form.useForm();
	const [fileList, setFileList] = useState<RcFile[]>([]);
	const [data, setData] = useState<T[]>([]);
	const [selectedSemester, setSelectedSemester] = useState<string>('');
	const [selectedMajor, setSelectedMajor] = useState<string>('');
	const [downloading, setDownloading] = useState(false);

	// Use Semester Store
	const {
		semesters,
		loading: semesterLoading,
		fetchSemesters,
		clearError: clearSemesterError,
	} = useSemesterStore();

	// Use Major Store
	const {
		majors,
		loading: majorLoading,
		fetchMajors,
		clearError: clearMajorError,
	} = useMajorStore();

	// Fetch semesters and majors on component mount
	useEffect(() => {
		if (requireSemester) {
			fetchSemesters();
		}
		if (requireMajor) {
			fetchMajors();
		}
	}, [fetchSemesters, fetchMajors, requireSemester, requireMajor]);

	// Clear errors when component mounts
	useEffect(() => {
		if (requireSemester) {
			clearSemesterError();
		}
		if (requireMajor) {
			clearMajorError();
		}
		return () => {
			if (requireSemester) {
				clearSemesterError();
			}
			if (requireMajor) {
				clearMajorError();
			}
		};
	}, [clearSemesterError, clearMajorError, requireSemester, requireMajor]);

	// Filter semesters for user creation (only Preparing and Picking status)
	const availableSemesters = semesters.filter(
		(semester) =>
			semester.status === 'Preparing' || semester.status === 'Picking',
	);

	// Check if there are any available semesters
	const hasAvailableSemesters = availableSemesters.length > 0;

	// Handle template download from public/files folder
	const handleDownloadTemplate = async () => {
		if (!templateFileName) {
			showNotification.error('Error', 'Template file is not available');
			return;
		}

		setDownloading(true);
		try {
			// Create download URL from public/files folder
			const downloadUrl = `/files/${templateFileName}`;

			// Create a temporary link to download the file
			const link = document.createElement('a');
			link.href = downloadUrl;
			link.download = templateFileName; // Use the actual filename
			link.target = '_blank';
			link.rel = 'noopener noreferrer';

			// Append to body, click, and remove
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			showNotification.success('Success', 'Template download started');
		} catch (error) {
			console.error('Download failed:', error);
			showNotification.error(
				'Error',
				'Failed to download template. Please try again.',
			);
		} finally {
			// Reset downloading state after a short delay
			setTimeout(() => setDownloading(false), 1000);
		}
	};

	const handleUpload = () => {
		if (requireSemester && !selectedSemester) {
			showNotification.error('Error', 'Please select a semester first');
			return false;
		}

		if (requireMajor && !selectedMajor) {
			showNotification.error('Error', 'Please select a major first');
			return false;
		}

		setData(mockData);
		showNotification.success(
			'Success',
			`${mockData.length} users data imported successfully`,
		);
		return false;
	};

	const handleFieldChange = (id: string, key: keyof T, value: unknown) => {
		setData((prev) =>
			prev.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
		);
	};

	const handleDelete = (id: string) => {
		setData((prev) => prev.filter((item) => item.id !== id));
	};

	const handleSemesterChange = (value: string) => {
		setSelectedSemester(value);
		// Clear data when semester changes
		if (data.length > 0) {
			setData([]);
			setFileList([]);
		}
	};

	const handleMajorChange = (value: string) => {
		setSelectedMajor(value);
		// Clear data when major changes
		if (data.length > 0) {
			setData([]);
			setFileList([]);
		}
	};

	const handleImportAll = () => {
		if (requireSemester && !selectedSemester) {
			showNotification.error('Error', 'Please select a semester');
			return;
		}

		if (requireMajor && !selectedMajor) {
			showNotification.error('Error', 'Please select a major');
			return;
		}

		onImport(
			data,
			requireSemester ? selectedSemester : undefined,
			requireMajor ? selectedMajor : undefined,
		);
	};

	// Calculate column span based on required fields
	const getColumnSpan = () => {
		const requiredFields = [requireSemester, requireMajor].filter(
			Boolean,
		).length;
		if (requiredFields === 0) return 24; // No dropdowns
		if (requiredFields === 1) return 24; // One dropdown full width
		if (requiredFields === 2) return 12; // Two dropdowns, each half width
		return 12;
	};

	const columns: ColumnsType<T> = [
		...fields.map((field) => ({
			title: field.title,
			dataIndex: field.key as string,
			width: 200,
			render: (_: unknown, record: T) =>
				field.type === 'text' ? (
					<Input
						value={record[field.key] as string}
						onChange={(e) =>
							handleFieldChange(record.id, field.key, e.target.value)
						}
					/>
				) : (
					<Select
						value={record[field.key] as string}
						onChange={(val) => handleFieldChange(record.id, field.key, val)}
						style={{ width: 120 }}
					>
						{field.options?.map((opt) => (
							<Select.Option key={opt.value} value={opt.value}>
								{opt.label}
							</Select.Option>
						))}
					</Select>
				),
		})),
		{
			title: 'Action',
			width: 80,
			render: (_: unknown, record: T) => (
				<Tooltip title="Delete">
					<Button
						icon={<DeleteOutlined />}
						danger
						type="text"
						onClick={() => handleDelete(record.id)}
					/>
				</Tooltip>
			),
		},
	];

	return (
		<Space direction="vertical" size="middle" style={{ width: '100%' }}>
			{/* Show warning when no available semesters (only if requireSemester) */}
			{requireSemester && !semesterLoading && !hasAvailableSemesters && (
				<Alert
					type="warning"
					showIcon
					message="No Available Semesters"
					description={
						<div>
							<p>
								Student accounts can only be created for semesters with{' '}
								<strong>Preparing</strong> or <strong>Picking</strong> status.
							</p>
							<p>
								Currently, there are no semesters in these statuses available
								for student creation.
							</p>
						</div>
					}
					style={{ marginBottom: 16 }}
				/>
			)}

			{/* Show info about allowed statuses (only if requireSemester) */}
			{requireSemester && hasAvailableSemesters && (
				<Alert
					type="info"
					showIcon
					message="Student Creation Policy"
					description={
						<div>
							Student accounts can only be created for semesters with{' '}
							<Tag color="orange" style={{ margin: '0 4px' }}>
								Preparing
							</Tag>
							or
							<Tag color="purple" style={{ margin: '0 4px' }}>
								Picking
							</Tag>
							status.
						</div>
					}
					style={{ marginBottom: 0 }}
				/>
			)}

			{/* Only show form if either semester or major is required */}
			{(requireSemester || requireMajor) && (
				<Form form={form} requiredMark={false} layout="vertical">
					<Row gutter={16}>
						{/* Semester dropdown - only show if requireSemester is true */}
						{requireSemester && (
							<Col xs={24} sm={getColumnSpan()}>
								<Form.Item
									name="semester"
									rules={[
										{ required: true, message: 'Please select a semester' },
									]}
									label={FormLabel({
										text: 'Semester',
										isRequired: true,
										isBold: true,
									})}
								>
									<Select
										placeholder={
											hasAvailableSemesters
												? 'Select semester (Preparing or Picking status only)'
												: 'No available semesters for user creation'
										}
										loading={semesterLoading}
										onChange={handleSemesterChange}
										value={selectedSemester || undefined}
										disabled={!hasAvailableSemesters}
										notFoundContent={
											!semesterLoading && !hasAvailableSemesters
												? 'No semesters with Preparing or Picking status found'
												: undefined
										}
									>
										{availableSemesters.map((semester) => (
											<Select.Option key={semester.id} value={semester.id}>
												<Space>
													<span>{semester.name}</span>
													{STATUS_TAG[semester.status]}
												</Space>
											</Select.Option>
										))}
									</Select>
								</Form.Item>
							</Col>
						)}

						{/* Major dropdown - only show if requireMajor is true */}
						{requireMajor && (
							<Col xs={24} sm={getColumnSpan()}>
								<Form.Item
									name="major"
									rules={[{ required: true, message: 'Please select a major' }]}
									label={FormLabel({
										text: 'Major',
										isRequired: true,
										isBold: true,
									})}
								>
									<Select
										placeholder="Select major"
										loading={majorLoading}
										onChange={handleMajorChange}
										value={selectedMajor || undefined}
										disabled={!majors.length}
										notFoundContent={
											!majorLoading && !majors.length
												? 'No majors found'
												: undefined
										}
									>
										{majors.map((major) => (
											<Select.Option key={major.id} value={major.id}>
												{major.name}
											</Select.Option>
										))}
									</Select>
								</Form.Item>
							</Col>
						)}
					</Row>
				</Form>
			)}

			<Card
				style={{
					border: '1px solid #f0f0f0',
					borderRadius: 8,
					background: '#fafafa',
				}}
			>
				<Row align="middle" justify="space-between" gutter={[16, 16]} wrap>
					<Col xs={24} sm={24} md={16}>
						<Typography.Text type="secondary" style={{ display: 'block' }}>
							{note}
						</Typography.Text>
					</Col>
					<Col xs={24} sm={24} md={8} style={{ textAlign: 'right' }}>
						<Button
							icon={<DownloadOutlined />}
							type="default"
							onClick={handleDownloadTemplate}
							disabled={!templateFileName || downloading}
							loading={downloading}
							title={
								!templateFileName
									? 'Template file not available'
									: 'Download Excel template'
							}
						>
							{downloading ? 'Downloading...' : 'Download Template'}
						</Button>
					</Col>
				</Row>
			</Card>

			<Dragger
				name="file"
				beforeUpload={handleUpload}
				fileList={fileList}
				onRemove={() => {
					setFileList([]);
					setData([]);
				}}
				maxCount={1}
				accept=".xlsx"
				disabled={
					(requireSemester && !selectedSemester) ||
					(requireSemester && !hasAvailableSemesters) ||
					(requireMajor && !selectedMajor)
				}
			>
				<p className="ant-upload-drag-icon">
					<CloudUploadOutlined />
				</p>
				<p className="ant-upload-text">
					{requireSemester && !hasAvailableSemesters
						? 'No available semesters for user creation'
						: requireSemester && !selectedSemester
							? 'Please select a semester first'
							: requireMajor && !selectedMajor
								? 'Please select a major first'
								: 'Drag and drop Excel file here, or click to browse'}
				</p>
				<p className="ant-upload-hint">
					{requireSemester && !hasAvailableSemesters
						? 'Only Preparing and Picking status semesters allow user creation'
						: (requireSemester && !selectedSemester) ||
							  (requireMajor && !selectedMajor)
							? 'Please complete all required selections for import'
							: 'Supports .xlsx files up to 20MB'}
				</p>
			</Dragger>

			{data.length > 0 && (
				<Space direction="vertical" style={{ width: '100%' }} size="middle">
					<Alert
						type="success"
						showIcon
						message={
							<Space direction="vertical" size={4}>
								<Space>
									<Typography.Text strong>
										{data.length} users data imported successfully
									</Typography.Text>
								</Space>
							</Space>
						}
						style={{ borderColor: '#bbf7d0', color: '#15803d' }}
					/>

					<Table
						dataSource={data}
						columns={columns}
						pagination={{
							showSizeChanger: true,
							showQuickJumper: true,
							showTotal: (total, range) =>
								`${range[0]}-${range[1]} of ${total} items`,
						}}
						bordered
						rowKey="id"
						scroll={{ x: '850' }}
					/>

					<Row justify="end" gutter={8}>
						<Col>
							<Button
								onClick={() => {
									setData([]);
									setFileList([]);
								}}
							>
								Cancel
							</Button>
						</Col>
						<Col>
							<Button
								type="primary"
								onClick={handleImportAll}
								disabled={
									(requireSemester && !selectedSemester) ||
									data.length === 0 ||
									(requireMajor && !selectedMajor)
								}
							>
								Import All Users ({data.length})
							</Button>
						</Col>
					</Row>
				</Space>
			)}
		</Space>
	);
}
