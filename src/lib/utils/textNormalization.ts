/**
 * Text normalization utilities for better search functionality
 * Handles Vietnamese diacritics and special characters
 */

/**
 * Normalizes Vietnamese text by removing diacritics and converting to lowercase
 * This enables flexible search without requiring exact accent matching
 *
 * @param text - The text to normalize
 * @returns Normalized text without diacritics
 *
 * @example
 * normalizeVietnameseText('Nguyễn Văn Đức') // returns 'nguyen van duc'
 * normalizeVietnameseText('Hệ thống quản lý') // returns 'he thong quan ly'
 */
export const normalizeVietnameseText = (text: string): string => {
	return text
		.toLowerCase()
		.normalize('NFD') // Decompose characters (á → a + ́)
		.replace(/[\u0300-\u036f]/g, '') // Remove diacritics
		.replace(/đ/g, 'd') // Replace đ with d
		.replace(/Đ/g, 'd'); // Replace Đ with d
};

/**
 * Checks if a search term matches any of the provided text fields
 * Uses normalized comparison for Vietnamese text
 *
 * @param searchTerm - The search keyword
 * @param textFields - Array of text fields to search in
 * @returns True if search term is found in any field
 *
 * @example
 * const fields = ['Nguyễn Văn Đức', 'Hệ thống AI'];
 * isTextMatch('duc', fields) // returns true
 * isTextMatch('he thong', fields) // returns true
 */
export const isTextMatch = (
	searchTerm: string,
	textFields: (string | undefined | null)[],
): boolean => {
	if (!searchTerm.trim()) return true;

	const normalizedSearchTerm = normalizeVietnameseText(searchTerm);

	return textFields.some((field) => {
		if (!field) return false;
		const normalizedField = normalizeVietnameseText(field);
		return normalizedField.includes(normalizedSearchTerm);
	});
};

/**
 * Creates a search filter function for arrays of objects
 *
 * @param searchTerm - The search keyword
 * @param fieldExtractor - Function to extract searchable fields from an object
 * @returns Filter function for array.filter()
 *
 * @example
 * const theses = [{ name: 'Hệ thống AI', lecturer: 'Nguyễn Đức' }];
 * const filtered = theses.filter(
 *   createSearchFilter('duc', (thesis) => [thesis.name, thesis.lecturer])
 * );
 */
export const createSearchFilter = <T>(
	searchTerm: string,
	fieldExtractor: (item: T) => (string | undefined | null)[],
) => {
	return (item: T): boolean => {
		const fields = fieldExtractor(item);
		return isTextMatch(searchTerm, fields);
	};
};
