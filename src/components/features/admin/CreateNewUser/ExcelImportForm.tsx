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
import { StudentCreate } from '@/schemas/student';
import { useMajorStore } from '@/store/useMajorStore';
import { useSemesterStore } from '@/store/useSemesterStore';
import { useStudentStore } from '@/store/useStudentStore';

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
		width?: string;
		key: keyof T;
		type: 'text' | 'select';
		options?: { label: string; value: string }[];
		required?: boolean;
	}[];
	onImport: (data: T[], semesterId?: string, majorId?: string) => void;
	templateFileName?: string;
	requireSemester?: boolean;
	requireMajor?: boolean;
}>;

// Field-specific validators
const fieldValidators = {
	fullName: (value: string, rowNumber: number): string[] => {
		const errors: string[] = [];
		if (value.length < 2) {
			errors.push(`Row ${rowNumber}: Full name must be at least 2 characters`);
		}
		if (value.length > 100) {
			errors.push(
				`Row ${rowNumber}: Full name must be less than 100 characters`,
			);
		}
		return errors;
	},

	email: (value: string, rowNumber: number): string[] => {
		const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
		return emailRegex.test(value)
			? []
			: [`Row ${rowNumber}: Invalid email format`];
	},

	phoneNumber: (value: string, rowNumber: number): string[] => {
		const phoneRegex =
			/^(?:\+84|0084|84|0)(?:3[2-9]|5[2689]|7[06-9]|8[1-5]|9[0-4|6-9])\d{7}$/;
		return phoneRegex.test(value)
			? []
			: [`Row ${rowNumber}: Invalid Vietnamese phone number format`];
	},

	studentId: (value: string, rowNumber: number): string[] => {
		const studentIdRegex = /^[A-Za-z]{2}\d{6}$/;
		return studentIdRegex.test(value)
			? []
			: [
					`Row ${rowNumber}: Student ID must be 2 letters followed by 6 digits (e.g., QE123456)`,
				];
	},

	gender: (value: string, rowNumber: number): string[] => {
		return ['Male', 'Female'].includes(value)
			? []
			: [`Row ${rowNumber}: Gender must be either 'Male' or 'Female'`];
	},
} as const;

// Helper function to validate field value
function validateFieldValue<T>(
	field: { key: keyof T; title: string; required?: boolean },
	value: unknown,
	rowNumber: number,
): string[] {
	const errors: string[] = [];
	const stringValue = value ? String(value).trim() : '';

	// Required field validation
	if (field.required && (!value || stringValue === '')) {
		return [`Row ${rowNumber}: Missing ${field.title}`];
	}

	// Skip validation for empty optional fields
	if (!field.required && (!value || stringValue === '')) {
		return errors;
	}

	// Apply field-specific validation if validator exists
	const fieldKey = field.key as string;
	const validator = fieldValidators[fieldKey as keyof typeof fieldValidators];

	if (validator) {
		errors.push(...validator(stringValue, rowNumber));
	}

	return errors;
}

// Helper function to check for duplicates
function checkDuplicates<
	T extends { id: string; email?: string; studentId?: string },
>(item: T, validatedData: T[], rowNumber: number): string[] {
	const errors: string[] = [];

	// Check for duplicate student IDs
	if ('studentId' in item && item['studentId']) {
		const duplicateIndex = validatedData.findIndex(
			(existingItem) =>
				'studentId' in existingItem &&
				existingItem['studentId'] === item['studentId'],
		);
		if (duplicateIndex !== -1) {
			errors.push(
				`Row ${rowNumber}: Duplicate Student ID '${item['studentId']}' found in row ${duplicateIndex + 2}`,
			);
		}
	}

	// Check for duplicate emails
	if ('email' in item && item['email']) {
		const duplicateIndex = validatedData.findIndex(
			(existingItem) =>
				'email' in existingItem &&
				typeof existingItem['email'] === 'string' &&
				String(existingItem['email']).toLowerCase() ===
					String(item['email']).toLowerCase(),
		);
		if (duplicateIndex !== -1) {
			errors.push(
				`Row ${rowNumber}: Duplicate email '${item['email']}' found in row ${duplicateIndex + 2}`,
			);
		}
	}

	return errors;
}

// Helper function to parse Excel data
function parseExcelData<T extends { id: string }>(
	jsonData: string[][],
	fields: { title: string; key: keyof T }[],
): T[] {
	const headers = jsonData[0];
	const dataRows = jsonData.slice(1);

	// Map headers to field keys
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

	if (Object.keys(fieldMapping).length === 0) {
		throw new Error(
			'No matching columns found. Please ensure your Excel headers match the template.',
		);
	}

	// Convert rows to objects
	return dataRows
		.filter((row) =>
			row.some((cell) => cell !== undefined && cell !== null && cell !== ''),
		)
		.map((row, index) => {
			const item = { id: `imported-${Date.now()}-${index}` } as Partial<T>;

			Object.entries(fieldMapping).forEach(([colIndex, fieldKey]) => {
				const cellValue = row[parseInt(colIndex)];
				if (cellValue !== undefined && cellValue !== null && cellValue !== '') {
					const stringValue = String(cellValue).trim();
					item[fieldKey] = (
						fieldKey === 'studentId' ? stringValue.toUpperCase() : stringValue
					) as T[keyof T];
				}
			});

			return item as T;
		})
		.filter((item) =>
			fields.some(
				(field) => item[field.key] && String(item[field.key]).trim() !== '',
			),
		);
}

// Helper function to validate all data
function validateAllData<
	T extends { id: string; email?: string; studentId?: string },
>(
	parsedData: T[],
	fields: {
		key: keyof T;
		title: string;
		required?: boolean;
		type: string;
		options?: { value: string }[];
	}[],
): { validatedData: T[]; validationErrors: string[] } {
	const validationErrors: string[] = [];
	const validatedData: T[] = [];

	parsedData.forEach((item, index) => {
		const rowErrors: string[] = [];
		const rowNumber = index + 2;

		// Validate each field
		fields.forEach((field) => {
			const fieldErrors = validateFieldValue(field, item[field.key], rowNumber);
			rowErrors.push(...fieldErrors);

			// Validate select fields
			if (field.type === 'select' && field.options) {
				const value = item[field.key];
				const stringValue = value ? String(value).trim() : '';
				if (stringValue && field.required) {
					const validOptions = field.options.map((opt) => opt.value);
					if (!validOptions.includes(stringValue)) {
						rowErrors.push(
							`Row ${rowNumber}: Invalid ${field.title}. Valid options: ${validOptions.join(', ')}`,
						);
					}
				}
			}
		});

		// Check for duplicates
		const duplicateErrors = checkDuplicates(item, validatedData, rowNumber);
		rowErrors.push(...duplicateErrors);

		validationErrors.push(...rowErrors);

		if (rowErrors.length === 0) {
			validatedData.push(item);
		}
	});

	return { validatedData, validationErrors };
}

export default function ExcelImportForm<
	T extends { id: string; email?: string; studentId?: string },
>({
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

	// Store hooks
	const {
		semesters,
		loading: semesterLoading,
		fetchSemesters,
		clearError: clearSemesterError,
	} = useSemesterStore();

	const {
		majors,
		loading: majorLoading,
		fetchMajors,
		clearError: clearMajorError,
	} = useMajorStore();

	const { createManyStudents, creatingMany, fetchStudents } = useStudentStore();

	// Effects
	useEffect(() => {
		if (requireSemester) fetchSemesters();
		if (requireMajor) fetchMajors();
	}, [fetchSemesters, fetchMajors, requireSemester, requireMajor]);

	useEffect(() => {
		if (requireSemester) clearSemesterError();
		if (requireMajor) clearMajorError();
		return () => {
			if (requireSemester) clearSemesterError();
			if (requireMajor) clearMajorError();
		};
	}, [clearSemesterError, clearMajorError, requireSemester, requireMajor]);

	// Computed values
	const availableSemesters = semesters.filter(
		(semester) =>
			semester.status === 'Preparing' || semester.status === 'Picking',
	);
	const hasAvailableSemesters = availableSemesters.length > 0;

	const handleDownloadTemplate = async () => {
		if (!templateFileName) {
			showNotification.error('Error', 'Template file is not available');
			return;
		}

		setDownloading(true);
		try {
			const downloadUrl = `/files/${templateFileName}`;
			const link = document.createElement('a');
			link.href = downloadUrl;
			link.download = templateFileName;
			link.target = '_blank';
			link.rel = 'noopener noreferrer';

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

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const data = e.target?.result;
				if (!data) {
					showNotification.error('Error', 'Failed to read file');
					return;
				}

				const workbook = XLSX.read(data, { type: 'binary' });
				const sheetName = workbook.SheetNames[0];
				const worksheet = workbook.Sheets[sheetName];
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

				const parsedData = parseExcelData(jsonData, fields);
				if (parsedData.length === 0) {
					showNotification.error('Error', 'No valid data found in Excel file');
					return;
				}

				const { validatedData, validationErrors } = validateAllData(
					parsedData,
					fields,
				);

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

					if (validatedData.length === 0) return;
				}

				setData(validatedData);
				setFileList([file]);

				const successMessage =
					validationErrors.length > 0
						? `${validatedData.length} out of ${parsedData.length} rows imported successfully. ${validationErrors.length} rows had validation errors.`
						: `${validatedData.length} rows imported successfully with no validation errors.`;

				showNotification[validationErrors.length > 0 ? 'warning' : 'success'](
					validationErrors.length > 0 ? 'Partial Import' : 'Success',
					successMessage,
				);
			} catch (error) {
				console.error('Error parsing Excel file:', error);
				showNotification.error(
					'Error',
					'Failed to parse Excel file. Please check the file format and try again.',
				);
			}
		};

		reader.onerror = () =>
			showNotification.error('Error', 'Failed to read file');
		reader.readAsArrayBuffer(file);
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

	const clearDataOnChange = () => {
		if (data.length > 0) {
			setData([]);
			setFileList([]);
		}
	};

	const handleSemesterChange = (value: string) => {
		setSelectedSemester(value);
		clearDataOnChange();
	};

	const handleMajorChange = (value: string) => {
		setSelectedMajor(value);
		clearDataOnChange();
	};

	const handleImportAll = async () => {
		if (requireSemester && !selectedSemester) {
			showNotification.error('Error', 'Please select a semester');
			return;
		}

		if (requireMajor && !selectedMajor) {
			showNotification.error('Error', 'Please select a major');
			return;
		}

		const studentsToCreate: StudentCreate[] = data.map((item) => {
			const studentData: StudentCreate = {
				...item,
				id: undefined,
				...(requireSemester &&
					selectedSemester && { semesterId: selectedSemester }),
				...(requireMajor && selectedMajor && { majorId: selectedMajor }),
			};

			return studentData;
		});

		try {
			const success = await createManyStudents(studentsToCreate);

			if (success) {
				await fetchStudents();
				setData([]);
				setFileList([]);
				setSelectedSemester('');
				setSelectedMajor('');
				form.resetFields();

				onImport(
					data,
					requireSemester ? selectedSemester : undefined,
					requireMajor ? selectedMajor : undefined,
				);
			}
		} catch (error) {
			console.error('Error creating students:', error);
			showNotification.error(
				'Error',
				'Failed to create students. Please try again.',
			);
		}
	};

	const getColumnSpan = () => {
		const requiredFields = [requireSemester, requireMajor].filter(
			Boolean,
		).length;
		if (requiredFields === 0) return 24;
		if (requiredFields === 1) return 24;
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
			width: field.width ?? 200,
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

	// Helper function to validate file type
	const isExcelFile = (file: RcFile): boolean => {
		const validMimeTypes = [
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'application/vnd.ms-excel',
		];

		const validExtensions = ['.xlsx', '.xls'];

		return (
			validMimeTypes.includes(file.type) ||
			validExtensions.some((ext) => file.name.endsWith(ext))
		);
	};

	// Helper function to validate file size
	const isValidFileSize = (file: RcFile, maxSizeMB = 100): boolean => {
		return file.size / 1024 / 1024 < maxSizeMB;
	};

	return (
		<Space direction="vertical" size="middle" style={{ width: '100%' }}>
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

			{(requireSemester || requireMajor) && (
				<Form form={form} requiredMark={false} layout="vertical">
					<Row gutter={16}>
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
										value={selectedSemester ?? undefined}
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
										value={selectedMajor ?? undefined}
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
					const isExcel = isExcelFile(file);
					const isLt100MB = isValidFileSize(file);

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
								loading={creatingMany}
								disabled={
									(requireSemester && !selectedSemester) ||
									data.length === 0 ||
									(requireMajor && !selectedMajor) ||
									creatingMany
								}
							>
								{creatingMany
									? `Creating Students...`
									: `Import All Users (${data.length})`}
							</Button>
						</Col>
					</Row>
				</Space>
			)}
		</Space>
	);
}
