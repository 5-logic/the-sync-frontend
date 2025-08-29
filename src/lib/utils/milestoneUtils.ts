/**
 * Milestone utility functions
 */

/**
 * Check if current time (already in Vietnam timezone) is within milestone period
 * @param startDate - Milestone start date string
 * @param endDate - Milestone end date string
 * @returns boolean - true if current time is within milestone period
 */
export const isWithinMilestonePeriod = (
	startDate: string,
	endDate: string,
): boolean => {
	try {
		// Get current time (already in Vietnam timezone since user is in Vietnam)
		const now = new Date();

		// Parse milestone dates from backend (assumed to be in UTC)
		const start = new Date(startDate);
		const end = new Date(endDate);

		// Convert milestone dates to Vietnam timezone (UTC+7)
		const vietnamStart = new Date(start.getTime() + 7 * 60 * 60 * 1000);
		const vietnamEnd = new Date(end.getTime() + 7 * 60 * 60 * 1000);

		// Set start time to beginning of day
		const startOfDay = new Date(vietnamStart);
		startOfDay.setHours(0, 0, 0, 0);

		// Set end time to end of day
		const endOfDay = new Date(vietnamEnd);
		endOfDay.setHours(23, 59, 59, 999);

		// Check if current time is within milestone period
		return now >= startOfDay && now <= endOfDay;
	} catch (error) {
		console.error('Error checking milestone period:', error);
		return false; // Deny access on error
	}
};

/**
 * Convert UTC date to Vietnam timezone for display
 * @param date - Date string or Date object
 * @returns Date object in Vietnam timezone
 */
export const convertToVietnamTime = (date: string | Date): Date => {
	const utcDate = typeof date === 'string' ? new Date(date) : date;
	return new Date(utcDate.getTime() + 7 * 60 * 60 * 1000);
};

/**
 * Test function for debugging milestone period logic
 * Usage in browser console: window.testMilestonePeriod('2025-08-01T00:00:00Z', '2025-08-02T23:59:59Z')
 */
export const testMilestonePeriod = (
	startDate: string,
	endDate: string,
): void => {
	console.log('=== Manual Milestone Test ===');
	console.log('Testing dates:', startDate, 'to', endDate);
	console.log('Result:', isWithinMilestonePeriod(startDate, endDate));
	console.log('=============================');
};

// Make test function available globally for debugging in browser
if (typeof window !== 'undefined') {
	(
		window as typeof window & {
			testMilestonePeriod: typeof testMilestonePeriod;
		}
	).testMilestonePeriod = testMilestonePeriod;
}
