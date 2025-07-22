import { message } from 'antd';
import * as XLSX from 'xlsx-js-style';

export interface ExcelExportData {
	'No.': number;
	'Student ID': string;
	'Full Name': string;
	Major: string;
	'Thesis Title': string;
	Abbreviation: string;
	Supervisor: string;
	Semester: string;
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

		// Add empty row
		XLSX.utils.sheet_add_aoa(ws, [[]], { origin: 'A2' });

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

		// Add headers and data starting from row 3
		const headers = Object.keys(exportData[0] || {});
		XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A3' });

		if (exportData.length > 0) {
			const dataRows = exportData.map((row) => Object.values(row));
			XLSX.utils.sheet_add_aoa(ws, dataRows, { origin: 'A4' });
		}

		// Set column widths
		const colWidths = [
			{ wch: 5 }, // No.
			{ wch: 15 }, // Student ID
			{ wch: 25 }, // Full Name
			{ wch: 20 }, // Major
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
	// Create merge ranges for grouped data
	const merges: XLSX.Range[] = [];
	let currentRow = 4; // Start from row 4 (after title, empty row, and header)

	// Merge title across all columns
	merges.push({
		s: { r: 0, c: 0 }, // A1
		e: { r: 0, c: 7 }, // H1 (8 columns)
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

		// Merge Abbreviation column (column F = index 5)
		if (item.rowSpanGroup > 1) {
			merges.push({
				s: { r: currentRow - 1, c: 5 },
				e: { r: currentRow - 1 + item.rowSpanGroup - 1, c: 5 },
			});
		}

		// Merge Supervisor column (column G = index 6)
		if (item.rowSpanGroup > 1) {
			merges.push({
				s: { r: currentRow - 1, c: 6 },
				e: { r: currentRow - 1 + item.rowSpanGroup - 1, c: 6 },
			});
		}

		// Merge Semester column (column H = index 7)
		if (item.rowSpanSemester > 1) {
			merges.push({
				s: { r: currentRow - 1, c: 7 },
				e: { r: currentRow - 1 + item.rowSpanSemester - 1, c: 7 },
			});
		}

		currentRow++;
	});

	// Apply merges to worksheet
	ws['!merges'] = merges;

	// Apply styling
	applyCellStyling(ws, groupBoundaries);
};

const applyCellStyling = (ws: XLSX.WorkSheet, groupBoundaries: number[]) => {
	const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:H1');

	for (let R = range.s.r; R <= range.e.r; ++R) {
		for (let C = range.s.c; C <= range.e.c; ++C) {
			const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });

			// Create cell if it doesn't exist
			if (!ws[cellAddress]) {
				ws[cellAddress] = { v: '', t: 's' };
			}

			// Default border style
			const borderStyle = {
				style: 'thin',
				color: { rgb: '000000' },
			};

			// Thick border for group boundaries
			const thickBorderStyle = {
				style: 'thick',
				color: { rgb: '000000' },
			};

			// Title row styling (row 0)
			if (R === 0) {
				ws[cellAddress].s = {
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
						fgColor: { rgb: 'D6EAF8' },
					},
					border: {
						top: { style: 'thick', color: { rgb: '000000' } },
						bottom: { style: 'thick', color: { rgb: '000000' } },
						left: { style: 'thick', color: { rgb: '000000' } },
						right: { style: 'thick', color: { rgb: '000000' } },
					},
				};
			}
			// Empty row (row 1) - no styling needed
			else if (R === 1) {
				continue;
			}
			// Header row styling (row 2)
			else if (R === 2) {
				ws[cellAddress].s = {
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
						fgColor: { rgb: 'E6F3FF' },
					},
					border: {
						top: { style: 'thick', color: { rgb: '000000' } },
						bottom: { style: 'thick', color: { rgb: '000000' } },
						left: { style: 'thick', color: { rgb: '000000' } },
						right: { style: 'thick', color: { rgb: '000000' } },
					},
				};
			}
			// Data rows styling (row 3+)
			else {
				ws[cellAddress].s = {
					alignment: {
						horizontal: 'center',
						vertical: 'center',
						wrapText: true,
					},
					border: {
						top: groupBoundaries.includes(R) ? thickBorderStyle : borderStyle,
						bottom: borderStyle,
						left: borderStyle,
						right: borderStyle,
					},
				};
			}
		}
	}
};
