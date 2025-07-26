/**
 * Color utility functions for consistent UI styling
 */

/**
 * Generate consistent color for semester based on semester name
 * Creates a simple hash from semesterName to get consistent color
 */
export const getSemesterTagColor = (semesterName: string): string => {
	const colors = [
		'purple',
		'blue',
		'green',
		'orange',
		'red',
		'cyan',
		'magenta',
		'volcano',
		'geekblue',
		'gold',
	];

	// Create a simple hash from semesterName to get consistent color
	let hash = 0;
	for (let i = 0; i < semesterName.length; i++) {
		hash = semesterName.charCodeAt(i) + ((hash << 5) - hash);
	}

	return colors[Math.abs(hash) % colors.length];
};
