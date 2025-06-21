/**
 * Student sidebar path mapping configuration
 * Maps multiple routes to their corresponding menu keys for proper highlighting
 */

export const STUDENT_MENU_KEYS = {
	DASHBOARD: '/student',
	LIST_THESIS: '/student/list-thesis',
	JOIN_GROUP: '/student/join-group',
	REGISTER_THESIS: '/student/register-thesis',
	GROUP_DASHBOARD: '/student/group-dashboard',
	TRACK_PROGRESS: '/student/track-progress',
} as const;

/**
 * Path mapping configuration for student sidebar
 * Each menu item can have multiple associated paths
 */
export const STUDENT_PATH_MAPPING = {
	[STUDENT_MENU_KEYS.LIST_THESIS]: [
		'/student/list-thesis',
		'/student/thesis-details',
		'/student/view-thesis',
	],
	[STUDENT_MENU_KEYS.JOIN_GROUP]: [
		'/student/join-group',
		'/student/create-group',
		'/student/group-invitation',
	],
	[STUDENT_MENU_KEYS.REGISTER_THESIS]: [
		'/student/register-thesis',
		'/student/thesis-registration',
		'/student/submit-thesis',
	],
	[STUDENT_MENU_KEYS.GROUP_DASHBOARD]: [
		'/student/group-dashboard',
		'/student/group-management',
		'/student/group-settings',
	],
	[STUDENT_MENU_KEYS.TRACK_PROGRESS]: [
		'/student/track-progress',
		'/student/progress-details',
		'/student/milestone-tracking',
	],
} as const;

/**
 * Determines the selected menu key based on the current path
 * @param currentPath - The current pathname
 * @returns The menu key that should be highlighted
 */
export function getSelectedMenuKey(currentPath: string): string {
	// Check each menu item's associated paths
	for (const [menuKey, paths] of Object.entries(STUDENT_PATH_MAPPING)) {
		if (paths.some((path) => currentPath.startsWith(path))) {
			return menuKey;
		}
	}

	// Default to exact path if no mapping found
	return currentPath;
}
