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
import * as XLSX from 'xlsx';

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

type ExcelImportFormProps<
	T extends { id: string; email?: string; studentId?: string },
> = Readonly<{
	note: string;
	fields: {
		title: string;
		width: string;
		key: keyof T;
		type: 'text' | 'select';
		options?: { label: string; value: string }[];
		required?: boolean;
	}[];
	onImport: (data: T[], semesterId?: string, majorId?: string) => void;
	templateFileName?: string; // Template file name in public/files folder
	requireSemester?: boolean; // Whether semester selection is required
	requireMajor?: boolean; // Whether major selection is required
}>;

export default function ExcelImportForm<T extends { id: string }>({
	note,
	fields,
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

	const handleUpload = (file: RcFile) => {
		if (requireSemester && !selectedSemester) {
			showNotification.error('Error', 'Please select a semester first');
			return false;
		}

		if (requireMajor && !selectedMajor) {
			showNotification.error('Error', 'Please select a major first');
			return false;
		}

		// Read Excel file
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const data = e.target?.result;
				if (!data) {
					showNotification.error('Error', 'Failed to read file');
					return;
				}

				// Parse Excel file
				const workbook = XLSX.read(data, { type: 'binary' });
				const sheetName = workbook.SheetNames[0]; // Get first sheet
				const worksheet = workbook.Sheets[sheetName];

				// Convert to JSON
				const jsonData = XLSX.utils.sheet_to_json(worksheet, {
					header: 1,
				}) as string[][];

				if (jsonData.length < 2) {
					showNotification.error(
						'Error',
						'Excel file must have at least 2 rows (header and data)',
					);
					return;
				}

				// Get header row and data rows
				const headers = jsonData[0];
				const dataRows = jsonData.slice(1);

				// Map headers to field keys (case-insensitive matching)
				const fieldMapping: Record<string, keyof T> = {};
				fields.forEach((field) => {
					const headerIndex = headers.findIndex(
						(header) =>
							header?.toString().toLowerCase().trim() ===
							field.title.toLowerCase().trim(),
					);
					if (headerIndex !== -1) {
						fieldMapping[headerIndex] = field.key;
					}
				});

				// Check if any fields were mapped
				if (Object.keys(fieldMapping).length === 0) {
					showNotification.error(
						'Error',
						'No matching columns found. Please ensure your Excel headers match the template.',
					);
					return;
				}

				// Convert rows to objects
				const parsedData: T[] = dataRows
					.filter((row) =>
						row.some(
							(cell) => cell !== undefined && cell !== null && cell !== '',
						),
					) // Filter out empty rows
					.map((row, index) => {
						const item = {
							id: `imported-${Date.now()}-${index}` as string,
						} as Partial<T>;

						// Map each cell to corresponding field
						Object.entries(fieldMapping).forEach(([colIndex, fieldKey]) => {
							const cellValue = row[parseInt(colIndex)];
							if (
								cellValue !== undefined &&
								cellValue !== null &&
								cellValue !== ''
							) {
								item[fieldKey] = String(cellValue).trim() as T[keyof T];
							}
						});

						return item as T;
					})
					.filter((item) => {
						// Ensure at least one field has data
						return fields.some(
							(field) =>
								item[field.key] && String(item[field.key]).trim() !== '',
						);
					});

				if (parsedData.length === 0) {
					showNotification.error('Error', 'No valid data found in Excel file');
					return;
				}

				// Enhanced validation for each row
				const validationErrors: string[] = [];
				const validatedData: T[] = [];

				parsedData.forEach((item, index) => {
					const rowErrors: string[] = [];
					const rowNumber = index + 2; // Excel row number (starting from 2)

					// Validate each field based on UserForm validation rules
					fields.forEach((field) => {
						const value = item[field.key];
						const stringValue = value ? String(value).trim() : '';

						// Required field validation
						if (field.required && (!value || stringValue === '')) {
							rowErrors.push(`Row ${rowNumber}: Missing ${field.title}`);
							return;
						}

						// Skip validation for empty optional fields
						if (!field.required && (!value || stringValue === '')) {
							return;
						}

						// Field-specific validation based on field key
						switch (field.key) {
							case 'fullName':
								if (stringValue.length < 2) {
									rowErrors.push(
										`Row ${rowNumber}: Full name must be at least 2 characters`,
									);
								}
								if (stringValue.length > 100) {
									rowErrors.push(
										`Row ${rowNumber}: Full name must be less than 100 characters`,
									);
								}
								break;

							case 'email':
								const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
								if (!emailRegex.test(stringValue)) {
									rowErrors.push(`Row ${rowNumber}: Invalid email format`);
								}
								break;

							case 'phoneNumber':
								const phoneRegex =
									/^(?:\+84|0084|84|0)(?:3[2-9]|5[2689]|7[06-9]|8[1-5]|9[0-4|6-9])\d{7}$/;
								if (!phoneRegex.test(stringValue)) {
									rowErrors.push(
										`Row ${rowNumber}: Invalid Vietnamese phone number format`,
									);
								}
								break;

							case 'studentId':
								const studentIdRegex = /^[A-Za-z]{2}\d{6}$/;
								if (!studentIdRegex.test(stringValue)) {
									rowErrors.push(
										`Row ${rowNumber}: Student ID must be 2 letters followed by 6 digits (e.g., QE123456)`,
									);
								}
								// Convert to uppercase for consistency
								item[field.key] = stringValue.toUpperCase() as T[keyof T];
								break;

							case 'gender':
								if (!['Male', 'Female'].includes(stringValue)) {
									rowErrors.push(
										`Row ${rowNumber}: Gender must be either 'Male' or 'Female'`,
									);
								}
								break;

							// Add validation for select fields
							default:
								if (field.type === 'select' && field.options) {
									const validOptions = field.options.map((opt) => opt.value);
									if (!validOptions.includes(stringValue)) {
										rowErrors.push(
											`Row ${rowNumber}: Invalid ${field.title}. Valid options: ${validOptions.join(', ')}`,
										);
									}
								}
								break;
						}
					});

					// Check for duplicate student IDs within the imported data
					if ('studentId' in item && item['studentId']) {
						const duplicateIndex = validatedData.findIndex(
							(existingItem) =>
								'studentId' in existingItem &&
								existingItem['studentId'] === item['studentId'],
						);
						if (duplicateIndex !== -1) {
							rowErrors.push(
								`Row ${rowNumber}: Duplicate Student ID '${item['studentId']}' found in row ${duplicateIndex + 2}`,
							);
						}
					}

					// Check for duplicate emails within the imported data
					if ('email' in item && item['email']) {
						const duplicateIndex = validatedData.findIndex(
							(existingItem) =>
								'email' in existingItem &&
								typeof existingItem['email'] === 'string' &&
								String(existingItem['email']).toLowerCase() ===
									String(item['email']).toLowerCase(),
						);
						if (duplicateIndex !== -1) {
							rowErrors.push(
								`Row ${rowNumber}: Duplicate email '${item['email']}' found in row ${duplicateIndex + 2}`,
							);
						}
					}

					// Add row errors to overall validation errors
					validationErrors.push(...rowErrors);

					// Only add to validated data if no errors for this row
					if (rowErrors.length === 0) {
						validatedData.push(item);
					}
				});

				// Show validation errors if any
				if (validationErrors.length > 0) {
					const errorMessage =
						validationErrors.slice(0, 10).join('\n') +
						(validationErrors.length > 10
							? `\n... and ${validationErrors.length - 10} more errors`
							: '');

					showNotification.error(
						`Validation Failed (${validationErrors.length} errors)`,
						errorMessage,
					);

					// If there are validation errors, don't proceed
					if (validatedData.length === 0) {
						return;
					}
				}

				setData(validatedData);
				setFileList([file]);

				if (validationErrors.length > 0) {
					showNotification.warning(
						'Partial Import',
						`${validatedData.length} out of ${parsedData.length} rows imported successfully. ${validationErrors.length} rows had validation errors.`,
					);
				} else {
					showNotification.success(
						'Success',
						`${validatedData.length} rows imported successfully with no validation errors.`,
					);
				}
			} catch (error) {
				console.error('Error parsing Excel file:', error);
				showNotification.error(
					'Error',
					'Failed to parse Excel file. Please check the file format and try again.',
				);
			}
		};

		reader.onerror = () => {
			showNotification.error('Error', 'Failed to read file');
		};

		reader.readAsBinaryString(file);
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
			title: (
				<span>
					{field.title}
					{field.required && <span style={{ color: 'red' }}> *</span>}
				</span>
			),
			dataIndex: field.key as string,
			width: field.width || 200,
			render: (_: unknown, record: T) =>
				field.type === 'text' ? (
					<Input
						value={record[field.key] as string}
						onChange={(e) =>
							handleFieldChange(record.id, field.key, e.target.value)
						}
						status={
							field.required &&
							(!record[field.key] || String(record[field.key]).trim() === '')
								? 'error'
								: undefined
						}
					/>
				) : (
					<Select
						value={record[field.key] as string}
						onChange={(val) => handleFieldChange(record.id, field.key, val)}
						style={{ width: 120 }}
						status={
							field.required &&
							(!record[field.key] || String(record[field.key]).trim() === '')
								? 'error'
								: undefined
						}
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
			width: '10%',
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
				beforeUpload={(file) => {
					const isExcel =
						file.type ===
							'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
						file.type === 'application/vnd.ms-excel' ||
						file.name.endsWith('.xlsx') ||
						file.name.endsWith('.xls');

					const isLt100MB = file.size / 1024 / 1024 < 100;

					if (!isExcel) {
						showNotification.warning(
							'Warning',
							'You can only upload Excel (.xlsx, .xls) files!',
						);
						return Upload.LIST_IGNORE;
					}

					if (!isLt100MB) {
						showNotification.error('Error', 'File must be smaller than 100MB!');
						return Upload.LIST_IGNORE;
					}

					// Process the Excel file
					return handleUpload(file);
				}}
				fileList={fileList}
				onRemove={() => {
					setFileList([]);
					setData([]);
				}}
				maxCount={1}
				accept=".xlsx,.xls"
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
					Supports .xlsx and .xls files up to 100MB
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
