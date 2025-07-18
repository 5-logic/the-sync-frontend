'use client';

import { CloudUploadOutlined } from '@ant-design/icons';
import { Card, Col, Row, Space, Typography, Upload } from 'antd';
import { DraggerProps } from 'antd/es/upload';
import { RcFile } from 'antd/es/upload/interface';
import { useState } from 'react';
import * as XLSX from 'xlsx';

import { DownloadTemplateButton } from '@/components/common/DownloadTemplateButton';
import { showNotification } from '@/lib/utils/notification';
import { ChecklistItem } from '@/schemas/checklist';

const { Dragger: AntDragger } = Upload;

interface ChecklistExcelImportProps {
	onImport: (items: ChecklistItem[]) => void;
	loading?: boolean;
}

interface ExcelChecklistItem {
	id: string;
	name: string;
	description: string;
	isRequired: boolean;
}

// Field configuration for checklist items
const checklistFields = [
	{
		title: 'Name',
		key: 'name' as keyof ExcelChecklistItem,
		type: 'text' as const,
		required: true,
		width: '30%',
	},
	{
		title: 'Description',
		key: 'description' as keyof ExcelChecklistItem,
		type: 'text' as const,
		required: true,
		width: '50%',
	},
	{
		title: 'Priority',
		key: 'isRequired' as keyof ExcelChecklistItem,
		type: 'select' as const,
		required: false,
		width: '20%',
		options: [
			{ label: 'Mandatory', value: 'true' },
			{ label: 'Optional', value: 'false' },
		],
	},
];

// Field-specific validators
const fieldValidators = {
	name: (value: string, rowNumber: number): string[] => {
		const errors: string[] = [];
		if (value.length < 2) {
			errors.push(`Row ${rowNumber}: Name must be at least 2 characters`);
		}
		if (value.length > 200) {
			errors.push(`Row ${rowNumber}: Name must be less than 200 characters`);
		}
		return errors;
	},

	description: (value: string, rowNumber: number): string[] => {
		const errors: string[] = [];
		if (value.length < 5) {
			errors.push(
				`Row ${rowNumber}: Description must be at least 5 characters`,
			);
		}
		if (value.length > 1000) {
			errors.push(
				`Row ${rowNumber}: Description must be less than 1000 characters`,
			);
		}
		return errors;
	},
} as const;

// Helper function to validate field value
function validateFieldValue(
	field: { key: keyof ExcelChecklistItem; title: string; required?: boolean },
	value: unknown,
	rowNumber: number,
): string[] {
	const errors: string[] = [];
	const stringValue = value ? String(value).trim() : '';

	// Check if required field is empty
	if (field.required && (!value || stringValue === '')) {
		return [`Row ${rowNumber}: ${field.title} cannot be empty`];
	}

	// Apply field-specific validation if validator exists
	const fieldKey = field.key as string;
	const validator = fieldValidators[fieldKey as keyof typeof fieldValidators];

	if (validator && stringValue) {
		errors.push(...validator(stringValue, rowNumber));
	}

	return errors;
}

// Helper function to check for duplicates
function checkDuplicates(
	item: ExcelChecklistItem,
	validatedData: ExcelChecklistItem[],
	rowNumber: number,
): string[] {
	const errors: string[] = [];

	// Check for duplicate names
	const duplicateIndex = validatedData.findIndex(
		(existingItem) =>
			existingItem.name.toLowerCase().trim() === item.name.toLowerCase().trim(),
	);
	if (duplicateIndex !== -1) {
		errors.push(
			`Row ${rowNumber}: Duplicate name '${item.name}' found in row ${duplicateIndex + 2}`,
		);
	}

	return errors;
}

// Helper function to parse Excel data
function parseExcelData(
	jsonData: string[][],
	fields: { title: string; key: keyof ExcelChecklistItem }[],
): ExcelChecklistItem[] {
	const headers = jsonData[0];
	const dataRows = jsonData.slice(1);

	// Map headers to field keys
	const fieldMapping: Record<string, keyof ExcelChecklistItem> = {};
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
			const item = {
				id: `imported-${Date.now()}-${index}`,
			} as Partial<ExcelChecklistItem>;

			Object.entries(fieldMapping).forEach(([colIndex, fieldKey]) => {
				const cellValue = row[parseInt(colIndex)];
				if (cellValue !== undefined && cellValue !== null && cellValue !== '') {
					if (fieldKey === 'isRequired') {
						// Handle boolean conversion for Priority field
						const stringValue = String(cellValue).toLowerCase().trim();
						item[fieldKey] =
							stringValue === 'true' ||
							stringValue === 'mandatory' ||
							stringValue === '1';
					} else {
						item[fieldKey] = String(cellValue).trim();
					}
				}
			});

			return item as ExcelChecklistItem;
		})
		.filter((item) =>
			fields.some(
				(field) => item[field.key] && String(item[field.key]).trim() !== '',
			),
		);
}

// Helper function to validate all data
function validateAllData(
	parsedData: ExcelChecklistItem[],
	fields: {
		key: keyof ExcelChecklistItem;
		title: string;
		required?: boolean;
		type: string;
		options?: { value: string }[];
	}[],
): { validatedData: ExcelChecklistItem[]; validationErrors: string[] } {
	const validationErrors: string[] = [];
	const validatedData: ExcelChecklistItem[] = [];

	parsedData.forEach((item, index) => {
		const rowErrors: string[] = [];
		const rowNumber = index + 2;

		// Validate each field
		fields.forEach((field) => {
			const fieldErrors = validateFieldValue(field, item[field.key], rowNumber);
			rowErrors.push(...fieldErrors);
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
function processExcelFile(
	data: ArrayBuffer,
	fields: {
		title: string;
		key: keyof ExcelChecklistItem;
		type: 'text' | 'select';
		options?: { label: string; value: string }[];
		required?: boolean;
	}[],
): { validatedData: ExcelChecklistItem[]; validationErrors: string[] } | null {
	try {
		const workbook = XLSX.read(data, { type: 'buffer' });
		const sheetName = workbook.SheetNames[0];
		const worksheet = workbook.Sheets[sheetName];
		const jsonData = XLSX.utils.sheet_to_json(worksheet, {
			header: 1,
		}) as string[][];

		if (jsonData.length < 2) {
			throw new Error(
				'Excel file must contain at least a header row and one data row',
			);
		}

		const parsedData = parseExcelData(jsonData, fields);

		if (parsedData.length === 0) {
			throw new Error('No valid data found in Excel file');
		}

		return validateAllData(parsedData, fields);
	} catch (error) {
		console.error('Error processing Excel file:', error);
		showNotification.error(
			'File Processing Error',
			error instanceof Error ? error.message : 'Failed to process Excel file',
		);
		return null;
	}
}

// Helper function to handle validation errors
function handleValidationErrors(validationErrors: string[]): void {
	const errorMessage =
		validationErrors.slice(0, 10).join('\n') +
		(validationErrors.length > 10
			? `\n... and ${validationErrors.length - 10} more errors`
			: '');

	showNotification.error(
		`Validation Failed (${validationErrors.length} errors)`,
		errorMessage,
	);
}

export default function ChecklistExcelImport({
	onImport,
	loading = false,
}: ChecklistExcelImportProps) {
	const [fileList, setFileList] = useState<RcFile[]>([]);

	const draggerProps: DraggerProps = {
		name: 'file',
		beforeUpload: (file) => {
			const isExcel =
				file.type ===
					'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
				file.type === 'application/vnd.ms-excel';

			if (!isExcel) {
				showNotification.warning(
					'Invalid File Type',
					'You can only upload Excel (.xlsx, .xls) files!',
				);
				return Upload.LIST_IGNORE;
			}

			const isLt100MB = file.size / 1024 / 1024 < 100;
			if (!isLt100MB) {
				showNotification.error(
					'File Too Large',
					'File must be smaller than 100MB!',
				);
				return Upload.LIST_IGNORE;
			}

			const reader = new FileReader();
			reader.onload = (e) => {
				const data = e.target?.result;
				if (data) {
					const result = processExcelFile(data as ArrayBuffer, checklistFields);
					if (result) {
						const { validatedData, validationErrors } = result;

						if (validationErrors.length > 0) {
							handleValidationErrors(validationErrors);
							return;
						}

						setFileList([file]);

						// Auto-import immediately after successful upload
						const checklistItems: ChecklistItem[] = validatedData.map(
							(item) => ({
								id: item.id,
								name: item.name,
								description: item.description,
								isRequired: item.isRequired,
								acceptance: 'NotAvailable' as const,
								checklistId: '',
								createdAt: new Date(),
								updatedAt: new Date(),
							}),
						);

						onImport(checklistItems);

						// Clear the file list after successful import
						setFileList([]);

						showNotification.success(
							'Import Successful',
							`${validatedData.length} items imported to checklist form successfully.`,
						);
					}
				}
			};
			reader.readAsArrayBuffer(file);

			return false;
		},
		fileList: fileList.map((file) => ({
			uid: file.uid,
			name: file.name,
			status: 'done' as const,
		})),
		onRemove: () => {
			setFileList([]);
		},
		maxCount: 1,
		accept: '.xlsx,.xls',
	};

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Card
				style={{
					border: '1px solid #f0f0f0',
					borderRadius: 8,
					background: '#fafafa',
					marginBottom: 16,
				}}
			>
				<Row align="middle" justify="space-between" gutter={[16, 16]} wrap>
					<Col xs={24} sm={24} md={16}>
						<Typography.Text type="secondary" style={{ display: 'block' }}>
							Please fill the template including Name, Description and Priority.
						</Typography.Text>
					</Col>
					<Col xs={24} sm={24} md={8} style={{ textAlign: 'right' }}>
						<DownloadTemplateButton
							templateFileName="Create Checklist Template.xlsx"
							buttonText="Download Checklist Template"
							buttonType="primary"
						/>
					</Col>
				</Row>
			</Card>

			<AntDragger {...draggerProps} disabled={loading}>
				<p className="ant-upload-drag-icon">
					<CloudUploadOutlined />
				</p>
				<p className="ant-upload-text">
					Drag and drop Excel file here, or click to browse
				</p>
				<p className="ant-upload-hint text-gray-400">
					Supports .xlsx and .xls files up to 100MB
				</p>
			</AntDragger>
		</Space>
	);
}
