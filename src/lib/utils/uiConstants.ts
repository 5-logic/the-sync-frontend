/**
 * UI Constants and utilities
 */

/**
 * Priority color mapping for checklist items
 */
export const PRIORITY_COLORS = {
	Mandatory: "red",
	Optional: "blue",
} as const;

/**
 * Get priority label and color for checklist item
 * @param isRequired - Whether the item is required
 * @returns Object with label and color
 */
export const getPriorityConfig = (isRequired: boolean) => {
	const label = isRequired ? "Mandatory" : "Optional";
	const color = PRIORITY_COLORS[label];
	return { label, color };
};

/**
 * Common responsive breakpoints for tables
 */
export const TABLE_RESPONSIVE = {
	xs: ["xs"],
	sm: ["sm", "md", "lg", "xl"],
	md: ["md", "lg", "xl"],
	lg: ["lg", "xl"],
	all: ["xs", "sm", "md", "lg", "xl"],
} as const;

/**
 * Standard table pagination configuration
 */
export const DEFAULT_TABLE_CONFIG = {
	pagination: {
		showSizeChanger: true,
		showQuickJumper: true,
		showTotal: (total: number, range: [number, number]) =>
			`${range[0]}-${range[1]} of ${total} items`,
	},
	scroll: { x: 800 },
	size: "middle" as const,
} as const;
