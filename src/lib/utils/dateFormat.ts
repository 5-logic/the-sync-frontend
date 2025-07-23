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

/**
 * Get milestone status based on current date
 * @param startDate - Milestone start date
 * @param endDate - Milestone end date
 * @returns Status string
 */
export const getMilestoneStatus = (
	startDate: DateInput,
	endDate: DateInput,
): 'Upcoming' | 'In Progress' | 'Ended' => {
	const now = dayjs();
	const start = dayjs(startDate);
	const end = dayjs(endDate);

	if (now.isAfter(end)) return 'Ended';
	if (now.isBefore(start)) return 'Upcoming';
	return 'In Progress';
};

/**
 * Calculate time remaining until a deadline
 * @param targetDate - Target date
 * @returns Formatted time remaining string
 */
export const getTimeRemaining = (targetDate: DateInput): string => {
	if (!targetDate) return '';

	const now = dayjs();
	const target = dayjs(targetDate);
	const diff = target.diff(now, 'day');

	if (diff < 0) return 'Overdue';
	if (diff === 0) return 'Due today';
	if (diff === 1) return '1 day remaining';
	return `${diff} days remaining`;
};
