import dayjs from 'dayjs';

/**
 * Type alias for date input - can be Date object, string, dayjs object, null or undefined
 */
type DateInput = Date | string | dayjs.Dayjs | null | undefined;

/**
 * Format date to dd/mm/yyyy format
 * @param date - Date to format (Date object, string, or dayjs object)
 * @returns Formatted date string in dd/mm/yyyy format
 */
export const formatDate = (date: DateInput): string => {
	if (!date) return '';

	try {
		return dayjs(date).format('DD/MM/YYYY');
	} catch (error) {
		console.error('Error formatting date:', error);
		return '';
	}
};

/**
 * Format date range to display format
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Formatted date range string
 */
export const formatDateRange = (
	startDate: DateInput,
	endDate: DateInput,
): string => {
	const start = formatDate(startDate);
	const end = formatDate(endDate);

	if (!start && !end) return '';
	if (!start) return end;
	if (!end) return start;

	return `${start} - ${end}`;
};

/**
 * Parse date string in dd/mm/yyyy format to dayjs object
 * @param dateString - Date string in dd/mm/yyyy format
 * @returns dayjs object or null if invalid
 */
export const parseDate = (dateString: string): dayjs.Dayjs | null => {
	if (!dateString) return null;

	try {
		const parsed = dayjs(dateString, 'DD/MM/YYYY', true);
		return parsed.isValid() ? parsed : null;
	} catch (error) {
		console.error('Error parsing date:', error);
		return null;
	}
};

/**
 * Date format constant for consistency
 */
export const DATE_FORMAT = 'DD/MM/YYYY' as const;
