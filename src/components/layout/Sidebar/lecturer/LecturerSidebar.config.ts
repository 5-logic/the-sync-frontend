import { DASHBOARD_PATHS } from '@/lib/auth/config/auth-constants';

/**
 * Lecturer sidebar path mapping configuration
 * Maps multiple routes to their corresponding menu keys for proper highlighting
 */

export const LECTURER_MENU_KEYS = {
	DASHBOARD: DASHBOARD_PATHS.LECTURER,
	THESIS_MANAGEMENT: '/lecturer/thesis-management',
	GROUP_PROGRESS: '/lecturer/group-progress',
	TIMELINE_REVIEW: '/lecturer/timeline-review',
	// Moderator features
	PUBLISH_THESIS: DASHBOARD_PATHS.LECTURER_ASSIGN_LIST_PUBLISH_THESIS,
	ASSIGN_STUDENT: DASHBOARD_PATHS.LECTURER_ASSIGN_STUDENT_LIST,
	ASSIGN_SUPERVISOR: DASHBOARD_PATHS.LECTURER_ASSIGN_SUPERVISOR,
	ASSIGN_LECTURER_REVIEW: DASHBOARD_PATHS.LECTURER_ASSIGN_LECTURER_REVIEW,
} as const;

/**
 * Path mapping configuration for lecturer sidebar
 * Each menu item can have multiple associated paths
 */
export const LECTURER_PATH_MAPPING = {
	[LECTURER_MENU_KEYS.THESIS_MANAGEMENT]: [
		'/lecturer/thesis-management',
		'/lecturer/thesis-details',
		'/lecturer/edit-thesis',
		'/lecturer/create-thesis',
	],
	[LECTURER_MENU_KEYS.GROUP_PROGRESS]: [
		'/lecturer/group-progress',
		'/lecturer/group-details',
	],
	[LECTURER_MENU_KEYS.TIMELINE_REVIEW]: [
		'/lecturer/timeline-review',
		'/lecturer/review-timeline',
	],
	[LECTURER_MENU_KEYS.PUBLISH_THESIS]: [
		DASHBOARD_PATHS.LECTURER_ASSIGN_LIST_PUBLISH_THESIS,
	],
	[LECTURER_MENU_KEYS.ASSIGN_STUDENT]: [
		DASHBOARD_PATHS.LECTURER_ASSIGN_STUDENT_LIST,
		'/lecturer/assign-student/[groupId]',
	],
	[LECTURER_MENU_KEYS.ASSIGN_SUPERVISOR]: [
		DASHBOARD_PATHS.LECTURER_ASSIGN_SUPERVISOR,
		'/lecturer/supervisor-assignment',
	],
	[LECTURER_MENU_KEYS.ASSIGN_LECTURER_REVIEW]: [
		DASHBOARD_PATHS.LECTURER_ASSIGN_LECTURER_REVIEW,
		'/lecturer/lecturer-review-assignment',
	],
} as const;

/**
 * Determines the selected menu key based on the current path
 * @param currentPath - The current pathname
 * @returns The menu key that should be highlighted
 */
export function getSelectedMenuKey(currentPath: string): string {
	// Check each menu item's associated paths
	for (const [menuKey, paths] of Object.entries(LECTURER_PATH_MAPPING)) {
		if (paths.some((path) => currentPath.startsWith(path))) {
			return menuKey;
		}
	}

	// Default to exact path if no mapping found
	return currentPath;
}
