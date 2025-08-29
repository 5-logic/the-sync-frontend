/**
 * UI Constants and utilities
 */
import { ChecklistReviewAcceptance } from '@/schemas/_enums';

/**
 * Priority color mapping for checklist items
 */
export const PRIORITY_COLORS = {
	Mandatory: 'red',
	Optional: 'blue',
} as const;

/**
 * Get priority label and color for checklist item
 * @param isRequired - Whether the item is required
 * @returns Object with label and color
 */
export const getPriorityConfig = (isRequired: boolean) => {
	const label = isRequired ? 'Mandatory' : 'Optional';
	const color = PRIORITY_COLORS[label];
	return { label, color };
};

/**
 * Review validation utilities
 */

interface ChecklistItem {
	id: string;
	isRequired: boolean;
}

interface ChecklistResponse {
	response?: ChecklistReviewAcceptance;
	notes?: string;
}

/**
 * Get mandatory items from checklist
 * @param checklistItems - Array of checklist items
 * @returns Array of mandatory items
 */
export const getMandatoryItems = <T extends ChecklistItem>(
	checklistItems: T[],
): T[] => {
	return checklistItems.filter((item) => item.isRequired);
};

/**
 * Get unanswered mandatory items
 * @param mandatoryItems - Array of mandatory items
 * @param answers - Record of answers
 * @returns Array of unanswered mandatory items
 */
export const getUnansweredMandatory = <T extends ChecklistItem>(
	mandatoryItems: T[],
	answers: Record<string, ChecklistResponse>,
): T[] => {
	return mandatoryItems.filter((item) => !answers[item.id]?.response);
};

/**
 * Get answered items from answers record
 * @param answers - Record of answers
 * @returns Array of answered items
 */
export const getAnsweredItems = (
	answers: Record<string, ChecklistResponse>,
): Array<[string, ChecklistResponse]> => {
	return Object.entries(answers).filter(([, response]) => response.response);
};

/**
 * Common responsive breakpoints for tables
 */
export const TABLE_RESPONSIVE = {
	xs: ['xs'],
	sm: ['sm', 'md', 'lg', 'xl'],
	md: ['md', 'lg', 'xl'],
	lg: ['lg', 'xl'],
	all: ['xs', 'sm', 'md', 'lg', 'xl'],
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
	size: 'middle' as const,
} as const;
