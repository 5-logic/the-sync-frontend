import * as XLSX from 'xlsx-js-style';

export interface CellStyle {
	alignment?: {
		horizontal?: string;
		vertical?: string;
		wrapText?: boolean;
	};
	font?: {
		bold?: boolean;
		sz?: number;
		color?: { rgb: string };
	};
	fill?: {
		patternType?: string;
		fgColor?: { rgb: string };
	};
	border?: {
		top?: { style: string; color: { rgb: string } };
		bottom?: { style: string; color: { rgb: string } };
		left?: { style: string; color: { rgb: string } };
		right?: { style: string; color: { rgb: string } };
	};
}

export const getBorderStyle = (
	style: 'thin' | 'medium' | 'thick',
	color = '000000',
) => ({
	style,
	color: { rgb: color },
});

export const getBaseCellAlignment = () => ({
	horizontal: 'center',
	vertical: 'center',
	wrapText: true,
});

export const getTitleStyle = (backgroundColor: string): CellStyle => ({
	alignment: getBaseCellAlignment(),
	font: {
		bold: true,
		sz: 16,
		color: { rgb: '000000' },
	},
	fill: {
		patternType: 'solid',
		fgColor: { rgb: backgroundColor },
	},
	border: {
		top: getBorderStyle('thin'),
		bottom: getBorderStyle('thin'),
		left: getBorderStyle('thin'),
		right: getBorderStyle('thin'),
	},
});

export const getSubtitleStyle = (backgroundColor: string): CellStyle => ({
	alignment: getBaseCellAlignment(),
	font: {
		bold: false,
		sz: 12,
		color: { rgb: '000000' },
	},
	fill: {
		patternType: 'solid',
		fgColor: { rgb: backgroundColor },
	},
	border: {
		top: getBorderStyle('thin'),
		bottom: getBorderStyle('thin'),
		left: getBorderStyle('thin'),
		right: getBorderStyle('thin'),
	},
});

export const getHeaderStyle = (backgroundColor: string): CellStyle => ({
	alignment: getBaseCellAlignment(),
	font: {
		bold: true,
		sz: 12,
		color: { rgb: '000000' },
	},
	fill: {
		patternType: 'solid',
		fgColor: { rgb: backgroundColor },
	},
	border: {
		top: getBorderStyle('thin'),
		bottom: getBorderStyle('thin'),
		left: getBorderStyle('thin'),
		right: getBorderStyle('thin'),
	},
});

export const getDataRowStyle = (
	rowIndex: number,
	groupBoundaries: number[],
	separatorColor = '808080',
): CellStyle => {
	const normalBorder = getBorderStyle('thin');
	const separatorBorder = getBorderStyle('medium', separatorColor);

	return {
		alignment: getBaseCellAlignment(),
		border: {
			top: groupBoundaries.includes(rowIndex) ? separatorBorder : normalBorder,
			bottom: normalBorder,
			left: normalBorder,
			right: normalBorder,
		},
	};
};

// Shared Excel export utilities
export const generateSubtitle = () => {
	const exportDate = new Date();
	const day = exportDate.getDate();
	const month = exportDate.getMonth() + 1; // getMonth() returns 0-11
	const year = exportDate.getFullYear();
	return `(Issued under Decision No. keynum/QĐ-FPTUBĐ dated ${day} month ${month} year ${year} of the Rector of FPT University)`;
};

export const addHeadersAndData = (
	ws: XLSX.WorkSheet,
	exportData: Array<Record<string, string | number | boolean>>,
) => {
	// Add headers and data starting from row 4
	const headers = Object.keys(exportData[0] || {});
	XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A4' });

	if (exportData.length > 0) {
		const dataRows = exportData.map((row) => Object.values(row));
		XLSX.utils.sheet_add_aoa(ws, dataRows, { origin: 'A5' });
	}
};

interface ExportDataItem {
	groupId: string;
	rowSpanMajor: number;
	rowSpanGroup: number;
	rowSpanSemester: number;
}

export const createMergesAndGroupBoundaries = (
	data: ExportDataItem[],
	totalColumns: number,
) => {
	const merges: XLSX.Range[] = [];
	let currentRow = 5; // Start from row 5 (after title, subtitle, empty row, and header)

	// Merge title across all columns
	merges.push({
		s: { r: 0, c: 0 }, // A1
		e: { r: 0, c: totalColumns - 1 }, // Last column
	});

	// Merge subtitle across all columns
	merges.push({
		s: { r: 1, c: 0 }, // A2
		e: { r: 1, c: totalColumns - 1 }, // Last column
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

		// Merge Semester column - different positions for different exporters
		const semesterColumnIndex = totalColumns === 7 ? 5 : 7; // Defense results: 5, Group management: 7
		if (item.rowSpanSemester > 1) {
			merges.push({
				s: { r: currentRow - 1, c: semesterColumnIndex },
				e: {
					r: currentRow - 1 + item.rowSpanSemester - 1,
					c: semesterColumnIndex,
				},
			});
		}

		// For group management - merge Abbreviation and Supervisor columns
		if (totalColumns === 8) {
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
		}

		currentRow++;
	});

	return { merges, groupBoundaries };
};

export const applyCellStyling = (
	ws: XLSX.WorkSheet,
	groupBoundaries: number[],
	totalColumns: number,
	getCellStyleFn: (
		rowIndex: number,
		groupBoundaries: number[],
	) => CellStyle | Record<string, never>,
) => {
	const columnLetter = String.fromCharCode(65 + totalColumns - 1); // A=65, so A+7=H for 8 columns
	const range = XLSX.utils.decode_range(ws['!ref'] || `A1:${columnLetter}1`);

	for (let R = range.s.r; R <= range.e.r; ++R) {
		for (let C = range.s.c; C <= range.e.c; ++C) {
			const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });

			// Create cell if it doesn't exist
			if (!ws[cellAddress]) {
				ws[cellAddress] = { v: '', t: 's' };
			}

			// Apply styling based on row type
			ws[cellAddress].s = getCellStyleFn(R, groupBoundaries);
		}
	}
};
