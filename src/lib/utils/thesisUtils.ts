/**
 * Utility functions for handling thesis data
 */

/**
 * Checks if a thesis name is considered "empty" or "not assigned"
 */
export const isThesisNameEmpty = (thesisName?: string): boolean => {
	return !thesisName || thesisName === 'Not assigned';
};

/**
 * Gets a clean thesis name for export (dash if not assigned)
 */
export const getCleanThesisNameForExport = (thesisName?: string): string => {
	return isThesisNameEmpty(thesisName) ? '-' : thesisName!;
};

/**
 * Gets a clean thesis name for search (returns undefined if not assigned to exclude from search)
 */
export const getCleanThesisNameForSearch = (
	thesisName?: string,
): string | undefined => {
	return isThesisNameEmpty(thesisName) ? undefined : thesisName;
};
