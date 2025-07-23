import { message } from 'antd';
import * as XLSX from 'xlsx-js-style';

import {
	addHeadersAndData,
	applyCellStyling,
	createMergesAndGroupBoundaries,
	getDataRowStyle,
	getHeaderStyle,
	getSubtitleStyle,
	getTitleStyle,
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

		// Create workbook and worksheet
		const wb = XLSX.utils.book_new();
		const ws = XLSX.utils.aoa_to_sheet([]);

		// Add title row
		XLSX.utils.sheet_add_aoa(ws, [[title]], { origin: 'A1' });

		// Add subtitle row
		const exportDate = new Date();
		const day = exportDate.getDate();
		const month = exportDate.getMonth() + 1; // getMonth() returns 0-11
		const year = exportDate.getFullYear();
		const subtitle = `(Issued under Decision No. keynum/QĐ-FPTUBĐ dated ${day} month ${month} year ${year} of the Rector of FPT University)`;
		XLSX.utils.sheet_add_aoa(ws, [[subtitle]], { origin: 'A2' });

		// Add empty row
		XLSX.utils.sheet_add_aoa(ws, [[]], { origin: 'A3' });

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
		const finalFilename =
			filename || `Capstone_Defense_Results_${dateString}.xlsx`;

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

	// Apply styling using shared utility
	applyCellStyling(ws, groupBoundaries, 7, getDefenseResultsCellStyle);
};

const getDefenseResultsCellStyle = (
	rowIndex: number,
	groupBoundaries: number[],
) => {
	if (rowIndex === 0) {
		return getTitleStyle('FFE6CC'); // Orange theme for defense results
	}
	if (rowIndex === 1) {
		return getSubtitleStyle('FFF2E6'); // Light orange theme for subtitle
	}
	if (rowIndex === 2) {
		return {}; // Empty row - no styling (white background, no borders)
	}
	if (rowIndex === 3) {
		return getHeaderStyle('FFF2E6'); // Light orange for header
	}
	return getDataRowStyle(rowIndex, groupBoundaries, '808080');
};
