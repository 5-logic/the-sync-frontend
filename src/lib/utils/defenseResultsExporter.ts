import { message } from 'antd';
import * as XLSX from 'xlsx-js-style';

import {
	addHeadersAndData,
	createMergesAndGroupBoundaries,
	getDataRowStyle,
	getDataRowStyleWithLeftAlign,
	getHeaderStyle,
	getSubtitleStyle,
	getTitleStyle,
	initializeExcelWorksheet,
} from '@/lib/utils/excelStyles';

export interface DefenseResultsExportData {
	'No.': number;
	'Student ID': string;
	'Full Name': string;
	Major: string;
	'Thesis Title': string;
	Semester: string;
	Status: string;
	[key: string]: string | number | boolean;
}

export interface DefenseResultsDataForExport {
	groupId: string;
	studentId: string;
	name: string;
	major: string;
	thesisName: string;
	semester: string;
	status?: string;
	rowSpanMajor: number;
	rowSpanGroup: number;
	rowSpanSemester: number;
}

export interface ExportDefenseResultsOptions {
	data: DefenseResultsDataForExport[];
	selectedSemester: string;
	statusUpdates?: Record<string, string>;
	filename?: string;
}

export const exportDefenseResultsToExcel = ({
	data,
	selectedSemester,
	statusUpdates = {},
	filename,
}: ExportDefenseResultsOptions) => {
	try {
		// Get semester text for title
		const semesterText =
			selectedSemester === 'all'
				? 'ALL SEMESTERS'
				: selectedSemester.toUpperCase();
		const title = `CAPSTONE DEFENSE RESULTS FOR ${semesterText}`;

		// Initialize Excel workbook and worksheet with title and subtitle
		const { wb, ws } = initializeExcelWorksheet(title);

		// Prepare data for Excel export
		const exportData: DefenseResultsExportData[] = data.map((item, index) => ({
			'No.': index + 1,
			'Student ID': item.studentId,
			'Full Name': item.name,
			Major: item.major,
			'Thesis Title': item.thesisName,
			Semester: item.semester,
			Status: statusUpdates[item.studentId] || item.status || 'Pass',
		}));

		// Add headers and data starting from row 4
		addHeadersAndData(ws, exportData);

		// Set column widths for defense results
		const colWidths = [
			{ wch: 5 }, // No.
			{ wch: 15 }, // Student ID
			{ wch: 25 }, // Full Name
			{ wch: 20 }, // Major
			{ wch: 40 }, // Thesis Title
			{ wch: 15 }, // Semester
			{ wch: 12 }, // Status
		];
		ws['!cols'] = colWidths;

		// Create merge ranges and apply styling
		applyDefenseResultsMergesAndStyling(ws, data);

		// Add worksheet to workbook
		XLSX.utils.book_append_sheet(wb, ws, 'Defense Results');

		// Generate filename
		const currentDate = new Date();
		const dateString = currentDate.toISOString().split('T')[0];
		let finalFilename =
			filename || `Capstone_Defense_Results_${dateString}.xlsx`;

		// Ensure filename ends with .xlsx
		if (!finalFilename.endsWith('.xlsx')) {
			finalFilename += '.xlsx';
		}

		// Write file
		XLSX.writeFile(wb, finalFilename);

		message.success('Defense results exported successfully!');
	} catch (error) {
		console.error('Error exporting defense results:', error);
		message.error('An error occurred while exporting defense results!');
	}
};

const applyDefenseResultsMergesAndStyling = (
	ws: XLSX.WorkSheet,
	data: DefenseResultsDataForExport[],
) => {
	// Create merge ranges and group boundaries using shared utility
	const { merges, groupBoundaries } = createMergesAndGroupBoundaries(data, 7);

	// Apply merges to worksheet
	ws['!merges'] = merges;

	// Apply styling using shared utility with special handling for Full Name column
	applyDefenseResultsCellStyling(ws, groupBoundaries, 7);
};

/**
 * Get cell style based on row index
 * Reduces complexity by extracting row-based styling logic
 */
const getCellStyleByRow = (
	rowIndex: number,
	columnIndex: number,
	groupBoundaries: number[],
): object => {
	switch (rowIndex) {
		case 0:
			return getTitleStyle('FFE6CC'); // Orange theme for defense results
		case 1:
			return getSubtitleStyle('FFF2E6'); // Light orange theme for subtitle
		case 2:
			return {}; // Empty row - no styling
		case 3:
			return getHeaderStyle('FFF2E6'); // Light orange for header
		default:
			return getDataRowStyleByColumn(rowIndex, columnIndex, groupBoundaries);
	}
};

/**
 * Get data row style based on column (Full Name gets left alignment)
 * Further reduces complexity by separating column-specific logic
 */
const getDataRowStyleByColumn = (
	rowIndex: number,
	columnIndex: number,
	groupBoundaries: number[],
): object => {
	const isFullNameColumn = columnIndex === 2;

	return isFullNameColumn
		? getDataRowStyleWithLeftAlign(rowIndex, groupBoundaries, '808080')
		: getDataRowStyle(rowIndex, groupBoundaries, '808080');
};

/**
 * Ensure cell exists in worksheet
 * Extracted for clarity and reusability
 */
const ensureCellExists = (ws: XLSX.WorkSheet, cellAddress: string): void => {
	if (!ws[cellAddress]) {
		ws[cellAddress] = { v: '', t: 's' };
	}
};

const applyDefenseResultsCellStyling = (
	ws: XLSX.WorkSheet,
	groupBoundaries: number[],
	totalColumns: number,
) => {
	const columnLetter = String.fromCharCode(65 + totalColumns - 1); // A=65, so A+7=H for 8 columns
	const range = XLSX.utils.decode_range(ws['!ref'] || `A1:${columnLetter}1`);

	for (let R = range.s.r; R <= range.e.r; ++R) {
		for (let C = range.s.c; C <= range.e.c; ++C) {
			const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });

			// Ensure cell exists
			ensureCellExists(ws, cellAddress);

			// Apply styling based on row and column
			const cellStyle = getCellStyleByRow(R, C, groupBoundaries);
			ws[cellAddress].s = cellStyle;
		}
	}
};
