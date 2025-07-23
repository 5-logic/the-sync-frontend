import { message } from 'antd';
import * as XLSX from 'xlsx-js-style';

import {
	addHeadersAndData,
	applyCellStyling as applySharedCellStyling,
	createMergesAndGroupBoundaries,
	generateSubtitle,
	getHeaderStyle,
	getDataRowStyle as getSharedDataRowStyle,
	getSubtitleStyle,
	getTitleStyle,
} from '@/lib/utils/excelStyles';

export interface ExcelExportData {
	'No.': number;
	'Student ID': string;
	'Full Name': string;
	Major: string;
	'Thesis Title': string;
	Abbreviation: string;
	Supervisor: string;
	Semester: string;
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
	semester: string;
	rowSpanMajor: number;
	rowSpanGroup: number;
	rowSpanSemester: number;
}

export interface ExportExcelOptions {
	data: GroupTableDataForExport[];
	selectedSemester: string;
	filename?: string;
}

export const exportToExcel = ({
	data,
	selectedSemester,
	filename,
}: ExportExcelOptions) => {
	try {
		// Get semester text for title
		const semesterText =
			selectedSemester === 'all'
				? 'ALL SEMESTERS'
				: selectedSemester.toUpperCase();
		const title = `LIST OF ASSIGNMENTS AND GUIDELINES FOR THESIS FOR ${semesterText}`;

		// Create workbook and worksheet
		const wb = XLSX.utils.book_new();
		const ws = XLSX.utils.aoa_to_sheet([]);

		// Add title row
		XLSX.utils.sheet_add_aoa(ws, [[title]], { origin: 'A1' });

		// Add subtitle row with decision information using current date
		const subtitle = generateSubtitle();
		XLSX.utils.sheet_add_aoa(ws, [[subtitle]], { origin: 'A2' });

		// Add empty row
		XLSX.utils.sheet_add_aoa(ws, [[]], { origin: 'A3' });

		// Prepare data for Excel export
		const exportData: ExcelExportData[] = data.map((item, index) => ({
			'No.': index + 1,
			'Student ID': item.studentId,
			'Full Name': item.name,
			Major: item.major,
			'Thesis Title': item.thesisName,
			Abbreviation: item.abbreviation || '',
			Supervisor: item.supervisor || '',
			Semester: item.semester,
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
			{ wch: 15 }, // Semester
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

		message.success('Excel file exported successfully!');
	} catch (error) {
		console.error('Error exporting Excel:', error);
		message.error('An error occurred while exporting Excel file!');
	}
};

const applyMergesAndStyling = (
	ws: XLSX.WorkSheet,
	data: GroupTableDataForExport[],
) => {
	// Create merge ranges and group boundaries using shared utility
	const { merges, groupBoundaries } = createMergesAndGroupBoundaries(data, 8);

	// Apply merges to worksheet
	ws['!merges'] = merges;

	// Apply styling using shared utility
	applySharedCellStyling(ws, groupBoundaries, 8, getCellStyle);
};

const getCellStyle = (rowIndex: number, groupBoundaries: number[]) => {
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
	return getSharedDataRowStyle(rowIndex, groupBoundaries);
};
