import * as XLSX from 'xlsx-js-style';

import {
	addHeadersAndData,
	createMergesAndGroupBoundaries,
	getHeaderStyle,
	getDataRowStyle as getSharedDataRowStyle,
	getSubtitleStyle,
	getTitleStyle,
	initializeExcelWorksheet,
} from '@/lib/utils/excelStyles';

import { showNotification } from './notification';

export interface ExcelExportData {
	'No.': number;
	'Student ID': string;
	'Full Name': string;
	Major: string;
	'Thesis Title': string;
	Abbreviation: string;
	Supervisor: string;
	[key: string]: string | number | boolean;
}

export interface GroupTableDataForExport {
	groupId: string;
	studentId: string;
	name: string;
	major: string;
	thesisName: string;
	abbreviation?: string;
	supervisor?: string;
	rowSpanMajor: number;
	rowSpanGroup: number;
}

export interface ExportExcelOptions {
	data: GroupTableDataForExport[];
	selectedSemester: string;
	semesterDisplayName?: string;
	filename?: string;
}

export const exportToExcel = ({
	data,
	selectedSemester,
	semesterDisplayName,
	filename,
}: ExportExcelOptions) => {
	try {
		// Get semester text for title
		const semesterText =
			semesterDisplayName ||
			(selectedSemester === 'all'
				? 'ALL SEMESTERS'
				: selectedSemester.toUpperCase());
		const title = `LIST OF ASSIGNMENTS AND GUIDELINES FOR THESIS FOR ${semesterText.toUpperCase()}`;

		// Initialize Excel workbook and worksheet with title and subtitle
		const { wb, ws } = initializeExcelWorksheet(title);

		// Prepare data for Excel export
		const exportData: ExcelExportData[] = data.map((item, index) => ({
			'No.': index + 1,
			'Student ID': item.studentId,
			'Full Name': item.name,
			Major: item.major,
			'Thesis Title': item.thesisName,
			Abbreviation: item.abbreviation || '',
			Supervisor: item.supervisor || '',
		}));

		// Add headers and data starting from row 4
		addHeadersAndData(ws, exportData);

		// Set column widths
		const colWidths = [
			{ wch: 5 }, // No.
			{ wch: 15 }, // Student ID
			{ wch: 25 }, // Full Name
			{ wch: 25 }, // Major
			{ wch: 40 }, // Thesis Title
			{ wch: 15 }, // Abbreviation
			{ wch: 30 }, // Supervisor
		];
		ws['!cols'] = colWidths;

		// Create merge ranges and apply styling
		applyMergesAndStyling(ws, data);

		// Add worksheet to workbook
		XLSX.utils.book_append_sheet(wb, ws, 'Group Management');

		// Generate filename
		const currentDate = new Date();
		const dateString = currentDate.toISOString().split('T')[0];
		const finalFilename = filename || `Capstone_Project_${dateString}.xlsx`;

		// Write file
		XLSX.writeFile(wb, finalFilename);

		showNotification.success(
			'Excel file exported successfully!',
			'Your file has been saved.',
		);
	} catch (error) {
		console.error('Error exporting Excel:', error);

		showNotification.error(
			'Export failed!',
			'An error occurred while exporting Excel file.',
		);
	}
};

const applyMergesAndStyling = (
	ws: XLSX.WorkSheet,
	data: GroupTableDataForExport[],
) => {
	// Create merge ranges and group boundaries using shared utility
	const { merges, groupBoundaries } = createMergesAndGroupBoundaries(data, 7);

	// Apply merges to worksheet
	ws['!merges'] = merges;

	// Apply styling using shared utility
	applyCustomCellStyling(ws, groupBoundaries, 7);
};

const applyCustomCellStyling = (
	ws: XLSX.WorkSheet,
	groupBoundaries: number[],
	totalColumns: number,
) => {
	const columnLetter = String.fromCharCode(65 + totalColumns - 1); // A=65, so A+6=G for 7 columns
	const range = XLSX.utils.decode_range(ws['!ref'] || `A1:${columnLetter}1`);

	for (let R = range.s.r; R <= range.e.r; ++R) {
		for (let C = range.s.c; C <= range.e.c; ++C) {
			const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });

			// Create cell if it doesn't exist
			if (!ws[cellAddress]) {
				ws[cellAddress] = { v: '', t: 's' };
			}

			// Apply styling based on row type and column
			ws[cellAddress].s = getCellStyle(R, C, groupBoundaries);
		}
	}
};

const getCellStyle = (
	rowIndex: number,
	columnIndex: number,
	groupBoundaries: number[],
) => {
	if (rowIndex === 0) {
		return getTitleStyle('D6EAF8'); // Blue theme for group management
	}
	if (rowIndex === 1) {
		return getSubtitleStyle('F0F8FF'); // Light blue theme for subtitle
	}
	if (rowIndex === 2) {
		return {}; // Empty row - no styling
	}
	if (rowIndex === 3) {
		return getHeaderStyle('E6F3FF'); // Light blue for header
	}

	// For data rows, apply custom alignment for Full Name column (index 2)
	const baseStyle = getSharedDataRowStyle(rowIndex, groupBoundaries);

	// Apply left alignment to Full Name column (column C, index 2)
	if (columnIndex === 2) {
		return {
			...baseStyle,
			alignment: {
				...baseStyle.alignment,
				horizontal: 'left',
			},
		};
	}

	return baseStyle;
};
