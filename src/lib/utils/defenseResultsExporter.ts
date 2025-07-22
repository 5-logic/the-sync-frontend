import { message } from 'antd';
import * as XLSX from 'xlsx-js-style';

export interface DefenseResultsExportData {
	'No.': number;
	'Student ID': string;
	'Full Name': string;
	Major: string;
	'Thesis Title': string;
	Semester: string;
	Status: string;
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

		// Add empty row
		XLSX.utils.sheet_add_aoa(ws, [[]], { origin: 'A2' });

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

		// Add headers and data starting from row 3
		const headers = Object.keys(exportData[0] || {});
		XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A3' });

		if (exportData.length > 0) {
			const dataRows = exportData.map((row) => Object.values(row));
			XLSX.utils.sheet_add_aoa(ws, dataRows, { origin: 'A4' });
		}

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
	// Create merge ranges for grouped data
	const merges: XLSX.Range[] = [];
	let currentRow = 4; // Start from row 4 (after title, empty row, and header)

	// Merge title across all columns (7 columns for defense results)
	merges.push({
		s: { r: 0, c: 0 }, // A1
		e: { r: 0, c: 6 }, // G1 (7 columns)
	});

	// Track group boundaries for borders
	const groupBoundaries: number[] = [];
	let lastGroupId = '';

	data.forEach((item) => {
		// Track group boundaries
		if (item.groupId !== lastGroupId && lastGroupId !== '') {
			groupBoundaries.push(currentRow - 1);
		}
		lastGroupId = item.groupId;

		// Merge Major column (column D = index 3)
		if (item.rowSpanMajor > 1) {
			merges.push({
				s: { r: currentRow - 1, c: 3 },
				e: { r: currentRow - 1 + item.rowSpanMajor - 1, c: 3 },
			});
		}

		// Merge Thesis Title column (column E = index 4)
		if (item.rowSpanGroup > 1) {
			merges.push({
				s: { r: currentRow - 1, c: 4 },
				e: { r: currentRow - 1 + item.rowSpanGroup - 1, c: 4 },
			});
		}

		// Merge Semester column (column F = index 5)
		if (item.rowSpanSemester > 1) {
			merges.push({
				s: { r: currentRow - 1, c: 5 },
				e: { r: currentRow - 1 + item.rowSpanSemester - 1, c: 5 },
			});
		}

		currentRow++;
	});

	// Apply merges to worksheet
	ws['!merges'] = merges;

	// Apply styling
	applyDefenseResultsCellStyling(ws, groupBoundaries);
};

const applyDefenseResultsCellStyling = (
	ws: XLSX.WorkSheet,
	groupBoundaries: number[],
) => {
	const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:G1');

	for (let R = range.s.r; R <= range.e.r; ++R) {
		for (let C = range.s.c; C <= range.e.c; ++C) {
			const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });

			// Create cell if it doesn't exist
			if (!ws[cellAddress]) {
				ws[cellAddress] = { v: '', t: 's' };
			}

			// Apply styling based on row type
			ws[cellAddress].s = getDefenseResultsCellStyle(R, groupBoundaries);
		}
	}
};

const getDefenseResultsCellStyle = (
	rowIndex: number,
	groupBoundaries: number[],
) => {
	if (rowIndex === 0) {
		return getDefenseResultsTitleRowStyle();
	}
	if (rowIndex === 1) {
		return {}; // Empty row - no styling
	}
	if (rowIndex === 2) {
		return getDefenseResultsHeaderRowStyle();
	}
	return getDefenseResultsDataRowStyle(rowIndex, groupBoundaries);
};

const getDefenseResultsTitleRowStyle = () => ({
	alignment: {
		horizontal: 'center',
		vertical: 'center',
		wrapText: true,
	},
	font: {
		bold: true,
		sz: 16,
		color: { rgb: '000000' },
	},
	fill: {
		patternType: 'solid',
		fgColor: { rgb: 'FFE6CC' }, // Orange theme for defense results
	},
	border: {
		top: { style: 'thin', color: { rgb: '000000' } },
		bottom: { style: 'thin', color: { rgb: '000000' } },
		left: { style: 'thin', color: { rgb: '000000' } },
		right: { style: 'thin', color: { rgb: '000000' } },
	},
});

const getDefenseResultsHeaderRowStyle = () => ({
	alignment: {
		horizontal: 'center',
		vertical: 'center',
		wrapText: true,
	},
	font: {
		bold: true,
		sz: 12,
		color: { rgb: '000000' },
	},
	fill: {
		patternType: 'solid',
		fgColor: { rgb: 'FFF2E6' }, // Light orange for header
	},
	border: {
		top: { style: 'thin', color: { rgb: '000000' } },
		bottom: { style: 'thin', color: { rgb: '000000' } },
		left: { style: 'thin', color: { rgb: '000000' } },
		right: { style: 'thin', color: { rgb: '000000' } },
	},
});

const getDefenseResultsDataRowStyle = (
	rowIndex: number,
	groupBoundaries: number[],
) => {
	const borderStyle = {
		style: 'thin',
		color: { rgb: '000000' },
	};

	const groupSeparatorStyle = {
		style: 'medium',
		color: { rgb: '808080' },
	};

	return {
		alignment: {
			horizontal: 'center',
			vertical: 'center',
			wrapText: true,
		},
		border: {
			top: groupBoundaries.includes(rowIndex)
				? groupSeparatorStyle
				: borderStyle,
			bottom: borderStyle,
			left: borderStyle,
			right: borderStyle,
		},
	};
};
