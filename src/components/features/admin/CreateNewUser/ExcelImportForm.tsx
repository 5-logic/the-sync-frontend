"use client";

import { CloudUploadOutlined, DeleteOutlined } from "@ant-design/icons";
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
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { RcFile } from "antd/es/upload";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

import { DownloadTemplateButton } from "@/components/common/DownloadTemplateButton";
import { FormLabel } from "@/components/common/FormLabel";
import { useCurrentSemester } from "@/hooks/semester/useCurrentSemester";
import { SEMESTER_STATUS_TAGS } from "@/lib/constants/semester";
import { showNotification } from "@/lib/utils/notification";
import { SemesterStatus } from "@/schemas/_enums";
import { LecturerCreate } from "@/schemas/lecturer";
import { ImportStudent, ImportStudentItem } from "@/schemas/student";
import {
	useLecturerStore,
	useMajorStore,
	useSemesterStore,
	useStudentStore,
} from "@/store";

const { Dragger } = Upload;

// Helper function to safely convert unknown values to string
function safeStringify(value: unknown): string {
	if (value == null) return "";

	// Handle objects that might stringify to '[object Object]'
	if (typeof value === "object") {
		// If object has a meaningful toString method, use it
		if (value.toString && typeof value.toString === "function") {
			const result = value.toString();
			// Avoid default Object toString result
			if (result === "[object Object]") {
				return JSON.stringify(value);
			}
			return result;
		}
		// Fallback to JSON.stringify for objects
		return JSON.stringify(value);
	}

	// For primitive types, String() is safe
	return String(value);
}

type ExcelImportFormProps<
	T extends { id: string; email?: string; studentCode?: string },
> = Readonly<{
	note: string;
	fields: {
		title: string;
		width?: string;
		key: keyof T;
		type: "text" | "select";
		options?: { label: string; value: string }[];
		required?: boolean;
	}[];
	onImport: (data: T[], semesterId?: string, majorId?: string) => void;
	templateFileName?: string;
	requireSemester?: boolean;
	requireMajor?: boolean;
	userType?: "student" | "lecturer"; // Add user type prop
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

	studentCode: (value: string, rowNumber: number): string[] => {
		const studentCodeRegex = /^[A-Za-z]{2}\d{6}$/;
		return studentCodeRegex.test(value)
			? []
			: [
					`Row ${rowNumber}: Student Code must be 2 letters followed by 6 digits (e.g., QE123456)`,
				];
	},

	gender: (value: string, rowNumber: number): string[] => {
		return ["Male", "Female"].includes(value)
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
	const stringValue = safeStringify(value).trim();

	// All fields are now required - no field can be empty
	if (!value || stringValue === "" || stringValue === "[object Object]") {
		return [`Row ${rowNumber}: ${field.title} cannot be empty`];
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
	T extends { id: string; email?: string; studentCode?: string },
>(item: T, validatedData: T[], rowNumber: number): string[] {
	const errors: string[] = [];

	// Check for duplicate student codes
	if ("studentCode" in item && item["studentCode"]) {
		const duplicateIndex = validatedData.findIndex(
			(existingItem) =>
				"studentCode" in existingItem &&
				existingItem["studentCode"] === item["studentCode"],
		);
		if (duplicateIndex !== -1) {
			errors.push(
				`Row ${rowNumber}: Duplicate Student Code '${item["studentCode"]}' found in row ${duplicateIndex + 2}`,
			);
		}
	}

	// Check for duplicate emails
	if ("email" in item && item["email"]) {
		const duplicateIndex = validatedData.findIndex(
			(existingItem) =>
				"email" in existingItem &&
				typeof existingItem["email"] === "string" &&
				safeStringify(existingItem["email"]).toLowerCase() ===
					safeStringify(item["email"]).toLowerCase(),
		);
		if (duplicateIndex !== -1) {
			errors.push(
				`Row ${rowNumber}: Duplicate email '${item["email"]}' found in row ${duplicateIndex + 2}`,
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
			"No matching columns found. Please ensure your Excel headers match the template.",
		);
	}

	// Convert rows to objects
	return dataRows
		.filter((row) =>
			row.some((cell) => cell !== undefined && cell !== null && cell !== ""),
		)
		.map((row, index) => {
			const item = { id: `imported-${Date.now()}-${index}` } as Partial<T>;

			Object.entries(fieldMapping).forEach(([colIndex, fieldKey]) => {
				const cellValue = row[parseInt(colIndex)];
				if (cellValue !== undefined && cellValue !== null && cellValue !== "") {
					const stringValue = safeStringify(cellValue).trim();
					item[fieldKey] = (
						fieldKey === "studentCode" ? stringValue.toUpperCase() : stringValue
					) as T[keyof T];
				}
			});

			return item as T;
		})
		.filter((item) =>
			fields.some(
				(field) =>
					item[field.key] && safeStringify(item[field.key]).trim() !== "",
			),
		);
}

// Helper function to validate all data
function validateAllData<
	T extends { id: string; email?: string; studentCode?: string },
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

			// Validate select fields - all fields must have values
			if (field.type === "select" && field.options) {
				const value = item[field.key];
				const stringValue = safeStringify(value).trim();
				if (stringValue) {
					const validOptions = field.options.map((opt) => opt.value);
					if (!validOptions.includes(stringValue)) {
						rowErrors.push(
							`Row ${rowNumber}: Invalid ${field.title}. Valid options: ${validOptions.join(", ")}`,
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

// Helper function to process Excel file data
function processExcelFile<
	T extends { id: string; email?: string; studentCode?: string },
>(
	data: ArrayBuffer,
	fields: {
		title: string;
		key: keyof T;
		type: "text" | "select";
		options?: { label: string; value: string }[];
		required?: boolean;
	}[],
): { validatedData: T[]; validationErrors: string[] } | null {
	try {
		const workbook = XLSX.read(data, { type: "binary" });
		const sheetName = workbook.SheetNames[0];
		const worksheet = workbook.Sheets[sheetName];
		const jsonData = XLSX.utils.sheet_to_json(worksheet, {
			header: 1,
		}) as string[][];

		if (jsonData.length < 2) {
			showNotification.error(
				"Error",
				"Excel file must have at least 2 rows (header and data)",
			);
			return null;
		}

		const parsedData = parseExcelData(jsonData, fields);
		if (parsedData.length === 0) {
			showNotification.error("Error", "No valid data found in Excel file");
			return null;
		}

		return validateAllData(parsedData, fields);
	} catch (error) {
		console.error("Error parsing Excel file:", error);
		showNotification.error(
			"Error",
			"Failed to parse Excel file. Please check the file format and try again.",
		);
		return null;
	}
}

// Helper function to validate upload prerequisites
function validateUploadPrerequisites(
	requireSemester: boolean,
	selectedSemester: string,
	requireMajor: boolean,
	selectedMajor: string,
): boolean {
	if (requireSemester && !selectedSemester) {
		showNotification.error("Error", "Please select a semester first");
		return false;
	}

	if (requireMajor && !selectedMajor) {
		showNotification.error("Error", "Please select a major first");
		return false;
	}

	return true;
}

// Helper function to validate all data before import
function validateDataBeforeImport<
	T extends { id: string; email?: string; studentCode?: string },
>(
	data: T[],
	fields: {
		key: keyof T;
		title: string;
		required?: boolean;
		type: string;
		options?: { value: string }[];
	}[],
): { isValid: boolean; errors: string[] } {
	const errors: string[] = [];

	data.forEach((item, index) => {
		const rowNumber = index + 1;

		fields.forEach((field) => {
			const value = item[field.key];
			const stringValue = safeStringify(value).trim();

			// Check if field is empty
			if (!value || stringValue === "") {
				errors.push(`Row ${rowNumber}: ${field.title} is required`);
				return;
			}

			// Apply field-specific validation if validator exists
			const fieldKey = field.key as string;
			const validator =
				fieldValidators[fieldKey as keyof typeof fieldValidators];

			if (validator) {
				const fieldErrors = validator(stringValue, rowNumber);
				errors.push(...fieldErrors);
			}

			// Validate select fields
			if (field.type === "select" && field.options) {
				const validOptions = field.options.map((opt) => opt.value);
				if (!validOptions.includes(stringValue)) {
					errors.push(
						`Row ${rowNumber}: Invalid ${field.title}. Valid options: ${validOptions.join(", ")}`,
					);
				}
			}
		});
	});

	return {
		isValid: errors.length === 0,
		errors,
	};
}

// Helper function to handle validation errors
function handleValidationErrors(validationErrors: string[]): void {
	const errorMessage =
		validationErrors.slice(0, 10).join("\n") +
		(validationErrors.length > 10
			? `\n... and ${validationErrors.length - 10} more errors`
			: "");

	showNotification.error(
		`Validation Failed (${validationErrors.length} errors)`,
		errorMessage,
	);
}

// Helper function to create table columns
function createTableColumns<
	T extends { id: string; email?: string; studentCode?: string },
>(
	fields: {
		title: string;
		width?: string;
		key: keyof T;
		type: "text" | "select";
		options?: { label: string; value: string }[];
		required?: boolean;
	}[],
	handleFieldChange: (id: string, key: keyof T, value: unknown) => void,
	handleDelete: (id: string) => void,
): ColumnsType<T> {
	return [
		...fields.map((field) => ({
			title: (
				<span>
					{field.title}
					{field.required && <span style={{ color: "red" }}> *</span>}
				</span>
			),
			dataIndex: field.key as string,
			width: field.width ?? 200,
			render: (_: unknown, record: T) =>
				field.type === "text" ? (
					<Input
						value={record[field.key] as string}
						onChange={(e) =>
							handleFieldChange(record.id, field.key, e.target.value)
						}
						status={
							!record[field.key] ||
							safeStringify(record[field.key]).trim() === ""
								? "error"
								: undefined
						}
					/>
				) : (
					<Select
						value={record[field.key] as string}
						onChange={(val) => handleFieldChange(record.id, field.key, val)}
						style={{ width: 120 }}
						status={
							!record[field.key] ||
							safeStringify(record[field.key]).trim() === ""
								? "error"
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
			title: "Action",
			width: "10%",
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
}

// Component for semester availability alerts
function SemesterAlerts({
	requireSemester,
	semesterLoading,
	hasAvailableSemesters,
	userType = "student",
}: Readonly<{
	requireSemester: boolean;
	semesterLoading: boolean;
	hasAvailableSemesters: boolean;
	userType?: "student" | "lecturer";
}>) {
	if (!requireSemester) return null;

	if (!semesterLoading && !hasAvailableSemesters) {
		return (
			<Alert
				type="warning"
				showIcon
				message="No Available Semesters"
				description={
					<div>
						<p>
							{userType === "lecturer" ? "Lecturer" : "Student"} accounts can
							only be created for semesters with <strong>Preparing</strong>{" "}
							status.
						</p>
						<p>
							Currently, there are no semesters in these statuses available for
							{userType === "lecturer" ? " lecturer" : " student"} creation.
						</p>
					</div>
				}
				style={{ marginBottom: 16 }}
			/>
		);
	}

	if (hasAvailableSemesters) {
		return (
			<Alert
				type="info"
				showIcon
				message={`${userType === "lecturer" ? "Lecturer" : "Student"} Creation Policy`}
				description={
					<div>
						{userType === "lecturer" ? "Lecturer" : "Student"} accounts can only
						be created for semesters with
						<Tag color="orange" style={{ margin: "0 4px" }}>
							Preparing
						</Tag>
						status.
					</div>
				}
				style={{ marginBottom: 0 }}
			/>
		);
	}

	return null;
}

// Component for form fields selection
function SelectionForm({
	form,
	requireSemester,
	requireMajor,
	getColumnSpan,
	availableSemesters,
	hasAvailableSemesters,
	semesterLoading,
	handleSemesterChange,
	majors,
	majorLoading,
	handleMajorChange,
	selectedMajor,
}: Readonly<{
	form: ReturnType<typeof Form.useForm>[0];
	requireSemester: boolean;
	requireMajor: boolean;
	getColumnSpan: () => number;
	availableSemesters: Array<{
		id: string;
		name: string;
		status: SemesterStatus;
	}>;
	hasAvailableSemesters: boolean;
	semesterLoading: boolean;
	handleSemesterChange: (value: string) => void;
	majors: Array<{ id: string; name: string }>;
	majorLoading: boolean;
	handleMajorChange: (value: string) => void;
	selectedMajor: string;
}>) {
	if (!requireSemester && !requireMajor) return null;

	return (
		<Form form={form} requiredMark={false} layout="vertical">
			<Row gutter={16}>
				{requireSemester && (
					<Col xs={24} sm={getColumnSpan()}>
						<Form.Item
							name="semester"
							rules={[{ required: true, message: "Please select a semester" }]}
							label={FormLabel({
								text: "Semester",
								isRequired: true,
								isBold: true,
							})}
						>
							<Select
								placeholder={
									hasAvailableSemesters
										? "Select semester (Preparing status only)"
										: "No available semesters for user creation"
								}
								loading={semesterLoading}
								onChange={handleSemesterChange}
								disabled={!hasAvailableSemesters}
								notFoundContent={
									!semesterLoading && !hasAvailableSemesters
										? "No semesters with Preparing status found"
										: undefined
								}
							>
								{availableSemesters.map((semester) => (
									<Select.Option key={semester.id} value={semester.id}>
										<Space>
											<span>{semester.name}</span>
											{SEMESTER_STATUS_TAGS[semester.status]}
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
							rules={[{ required: true, message: "Please select a major" }]}
							label={FormLabel({
								text: "Major",
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
										? "No majors found"
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
	);
}

// Helper function to get upload text
function getUploadText(
	requireSemester: boolean,
	hasAvailableSemesters: boolean,
	selectedSemester: string,
	requireMajor: boolean,
	selectedMajor: string,
	userType: "student" | "lecturer" = "student",
): string {
	if (requireSemester && !hasAvailableSemesters) {
		return `No available semesters for ${userType} creation`;
	}
	if (requireSemester && !selectedSemester) {
		return "Please select a semester first";
	}
	if (requireMajor && !selectedMajor) {
		return "Please select a major first";
	}
	return "Drag and drop Excel file here, or click to browse";
}

// Component for imported data table
function ImportedDataTable<
	T extends { id: string; email?: string; studentCode?: string },
>({
	data,
	columns,
	setData,
	setFileList,
	handleImportAll,
	creatingMany,
	requireSemester,
	selectedSemester,
	requireMajor,
	selectedMajor,
	userType = "student",
	hasValidationErrors = false,
}: Readonly<{
	data: T[];
	columns: ColumnsType<T>;
	setData: (data: T[]) => void;
	setFileList: (files: RcFile[]) => void;
	handleImportAll: () => void;
	creatingMany: boolean;
	requireSemester: boolean;
	selectedSemester: string;
	requireMajor: boolean;
	selectedMajor: string;
	userType?: "student" | "lecturer";
	hasValidationErrors?: boolean;
}>) {
	if (data.length === 0) return null;

	const userTypeText = userType === "lecturer" ? "Lecturers" : "Students";
	const buttonText = creatingMany
		? `Creating ${userTypeText}...`
		: `Import All ${userTypeText} (${data.length})`;

	return (
		<Space direction="vertical" style={{ width: "100%" }} size="middle">
			<Alert
				type="success"
				showIcon
				message={
					<Typography.Text strong>
						{data.length} {userType === "lecturer" ? "lecturers" : "students"}
						data imported successfully
					</Typography.Text>
				}
				style={{ borderColor: "#bbf7d0", color: "#15803d" }}
			/>
			{hasValidationErrors && (
				<Alert
					type="error"
					showIcon
					message="Validation Errors Found"
					description="Please fill in all required fields (highlighted in red) before importing."
					style={{ marginBottom: 16 }}
				/>
			)}
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
				scroll={{ x: "850" }}
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
							creatingMany ||
							hasValidationErrors
						}
					>
						{buttonText}
					</Button>
				</Col>
			</Row>
		</Space>
	);
}

export default function ExcelImportForm<
	T extends {
		id: string;
		email?: string;
		studentCode?: string;
		fullName?: string;
		phoneNumber?: string;
		gender?: string;
	},
>({
	note,
	fields,
	onImport,
	templateFileName,
	requireSemester = false,
	requireMajor = false,
	userType = "student", // Default to student
}: ExcelImportFormProps<T>) {
	const router = useRouter();
	const [form] = Form.useForm();
	const [fileList, setFileList] = useState<RcFile[]>([]);
	const [data, setData] = useState<T[]>([]);
	const [selectedSemester, setSelectedSemester] = useState<string>("");
	const [selectedMajor, setSelectedMajor] = useState<string>("");

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

	const {
		createManyStudents,
		creatingMany: creatingManyStudents,
		fetchStudents,
		fetchStudentsBySemester,
		selectedSemesterId,
	} = useStudentStore();

	const {
		createManyLecturers,
		creatingMany: creatingManyLecturers,
		fetchLecturers,
	} = useLecturerStore();

	// Use current semester hook for auto-selection (only for students)
	const { currentSemester } = useCurrentSemester();

	// Determine which loading state to use based on user type
	const creatingMany =
		userType === "lecturer" ? creatingManyLecturers : creatingManyStudents;

	// Computed values
	const availableSemesters = semesters.filter(
		(semester) => semester.status === "Preparing",
	);
	const hasAvailableSemesters = availableSemesters.length > 0;

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

	// Auto-select semester for students (only Preparing status allowed)
	useEffect(() => {
		if (
			requireSemester &&
			!semesterLoading &&
			hasAvailableSemesters &&
			!selectedSemester // Only set if not already selected
		) {
			// If current semester is Preparing, use it; otherwise use first Preparing semester
			const targetSemester =
				availableSemesters.find(
					(semester) =>
						semester.id === currentSemester?.id &&
						semester.status === "Preparing",
				) || availableSemesters[0];

			if (targetSemester) {
				setSelectedSemester(targetSemester.id);
				// Also set form field value for Ant Design Form
				form.setFieldValue("semester", targetSemester.id);
			}
		}
	}, [
		requireSemester,
		semesterLoading,
		hasAvailableSemesters,
		selectedSemester,
		currentSemester,
		availableSemesters,
		form,
	]);

	const handleUpload = (file: RcFile): boolean | typeof Upload.LIST_IGNORE => {
		// Validate prerequisites first - return false if validation fails
		const prerequisitesValid = validateUploadPrerequisites(
			requireSemester,
			selectedSemester,
			requireMajor,
			selectedMajor,
		);

		if (!prerequisitesValid) {
			// Prerequisites not met - reject the file upload
			return Upload.LIST_IGNORE;
		}

		// Start file processing - return false to prevent default upload behavior
		// (we handle the upload manually via FileReader)
		const reader = new FileReader();
		reader.onload = (e) => {
			const data = e.target?.result;
			if (!data) {
				showNotification.error("Error", "Failed to read file");
				return;
			}

			const result = processExcelFile(data as ArrayBuffer, fields);
			if (!result) return;

			const { validatedData, validationErrors } = result;

			if (validationErrors.length > 0) {
				handleValidationErrors(validationErrors);
				setData([]);
				setFileList([]);
				return;
			}

			setData(validatedData);
			setFileList([file]);
			// Success notification will be shown after successful database creation

			showNotification.success(
				"File Processed",
				`${validatedData.length} ${userType === "lecturer" ? "lecturers" : "students"} ready for import.`,
			);
		};

		reader.onerror = () =>
			showNotification.error("Error", "Failed to read file");
		reader.readAsArrayBuffer(file);

		// Return false to prevent Ant Design's default upload behavior
		// This allows us to handle the file processing manually
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

	// Helper function to reset form state after successful import
	const resetFormState = () => {
		setData([]);
		setFileList([]);
		setSelectedSemester("");
		setSelectedMajor("");
		form.resetFields();
	};

	// Helper function to handle lecturer import
	const handleLecturerImport = async (): Promise<boolean> => {
		const lecturersToCreate: LecturerCreate[] = data.map((item) => ({
			email: String(item.email ?? ""),
			fullName: String(item.fullName ?? ""),
			phoneNumber: String(item.phoneNumber ?? ""),
			gender: (item.gender === "Male" || item.gender === "Female"
				? item.gender
				: "Male") as "Male" | "Female",
		}));

		try {
			const success = await createManyLecturers({
				lecturers: lecturersToCreate,
			});
			if (success) {
				await fetchLecturers();
				showNotification.success(
					"Import Successful",
					`${data.length} lecturers have been imported successfully.`,
				);
				return true;
			}
			return false;
		} catch (error) {
			console.error("Error creating lecturers:", error);
			showNotification.error(
				"Error",
				"Failed to create lecturers. Please try again.",
			);
			return false;
		}
	};

	// Helper function to handle student import
	const handleStudentImport = async (): Promise<boolean> => {
		// Get semester ID from form to ensure consistency
		const formSemesterId = form.getFieldValue("semester") || selectedSemester;
		const formMajorId = form.getFieldValue("major") || selectedMajor;

		const importStudentDto: ImportStudent = {
			semesterId: formSemesterId!,
			majorId: formMajorId!,
			students: (data as unknown as (ImportStudentItem & { id: string })[]).map(
				(item) => ({
					studentCode: item.studentCode,
					email: item.email,
					fullName: item.fullName,
					password: item.password,
					gender: item.gender,
					phoneNumber: item.phoneNumber,
				}),
			),
		};

		try {
			const success = await createManyStudents(importStudentDto);
			if (success) {
				// Refresh students for the current semester
				if (selectedSemesterId) {
					await fetchStudentsBySemester(selectedSemesterId);
				} else {
					await fetchStudents();
				}
				showNotification.success(
					"Import Successful",
					`${data.length} students have been imported successfully.`,
				);
				router.push("/admin/students-management");
				return true;
			}
			return false;
		} catch (error) {
			console.error("Error creating students:", error);
			showNotification.error(
				"Error",
				"Failed to create students. Please try again.",
			);
			return false;
		}
	};

	const handleImportAll = async () => {
		// Get current values from form to ensure accuracy
		const currentSemesterId =
			form.getFieldValue("semester") || selectedSemester;
		const currentMajorId = form.getFieldValue("major") || selectedMajor;

		if (
			!validateUploadPrerequisites(
				requireSemester,
				currentSemesterId,
				requireMajor,
				currentMajorId,
			)
		) {
			return;
		}

		// Validate all data before import
		const validation = validateDataBeforeImport(data, fields);
		if (!validation.isValid) {
			const errorMessage =
				validation.errors.slice(0, 10).join("\n") +
				(validation.errors.length > 10
					? `\n... and ${validation.errors.length - 10} more errors`
					: "");

			showNotification.error(
				`Validation Failed (${validation.errors.length} errors)`,
				errorMessage,
			);
			return;
		}

		const success =
			userType === "lecturer"
				? await handleLecturerImport()
				: await handleStudentImport();

		if (success) {
			resetFormState();
			onImport(
				data,
				requireSemester ? selectedSemester : undefined,
				requireMajor ? selectedMajor : undefined,
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

	// Check if there are any validation errors in current data
	const hasValidationErrors = (): boolean => {
		const validation = validateDataBeforeImport(data, fields);
		return !validation.isValid;
	};

	const columns = createTableColumns(fields, handleFieldChange, handleDelete);

	// Helper function to validate file type
	const isExcelFile = (file: RcFile): boolean => {
		const validMimeTypes = [
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			"application/vnd.ms-excel",
		];
		const validExtensions = [".xlsx", ".xls"];
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
		<Space direction="vertical" size="middle" style={{ width: "100%" }}>
			<SemesterAlerts
				requireSemester={requireSemester}
				semesterLoading={semesterLoading}
				hasAvailableSemesters={hasAvailableSemesters}
				userType={userType}
			/>
			<SelectionForm
				form={form}
				requireSemester={requireSemester}
				requireMajor={requireMajor}
				getColumnSpan={getColumnSpan}
				availableSemesters={availableSemesters}
				hasAvailableSemesters={hasAvailableSemesters}
				semesterLoading={semesterLoading}
				handleSemesterChange={handleSemesterChange}
				majors={majors}
				majorLoading={majorLoading}
				handleMajorChange={handleMajorChange}
				selectedMajor={selectedMajor}
			/>
			<Card
				style={{
					border: "1px solid #f0f0f0",
					borderRadius: 8,
					background: "#fafafa",
				}}
			>
				<Row align="middle" justify="space-between" gutter={[16, 16]} wrap>
					<Col xs={24} sm={24} md={16}>
						<Typography.Text type="secondary" style={{ display: "block" }}>
							{note}
						</Typography.Text>
					</Col>
					<Col xs={24} sm={24} md={8} style={{ textAlign: "right" }}>
						<DownloadTemplateButton templateFileName={templateFileName!} />
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
							"Warning",
							"You can only upload Excel (.xlsx, .xls) files!",
						);
						return Upload.LIST_IGNORE;
					}

					if (!isLt100MB) {
						showNotification.error("Error", "File must be smaller than 100MB!");
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
					{getUploadText(
						requireSemester,
						hasAvailableSemesters,
						selectedSemester,
						requireMajor,
						selectedMajor,
						userType,
					)}
				</p>
				<p className="ant-upload-hint">
					Supports .xlsx and .xls files up to 100MB
				</p>
			</Dragger>
			<ImportedDataTable
				data={data}
				columns={columns}
				setData={setData}
				setFileList={setFileList}
				handleImportAll={handleImportAll}
				creatingMany={creatingMany}
				requireSemester={requireSemester}
				selectedSemester={selectedSemester}
				requireMajor={requireMajor}
				selectedMajor={selectedMajor}
				userType={userType}
				hasValidationErrors={hasValidationErrors()}
			/>
		</Space>
	);
}
