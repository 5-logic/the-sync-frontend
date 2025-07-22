// Shared Excel styling utilities
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
