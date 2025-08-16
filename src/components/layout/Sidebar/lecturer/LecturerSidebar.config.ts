import { DASHBOARD_PATHS } from "@/lib/auth/config/auth-constants";

/**
 * Lecturer sidebar path mapping configuration
 * Maps multiple routes to their corresponding menu keys for proper highlighting
 */

export const LECTURER_MENU_KEYS = {
	DASHBOARD: DASHBOARD_PATHS.LECTURER,
	THESIS_MANAGEMENT: "/lecturer/thesis-management",
	REQUEST_APPLY_THESIS: "/lecturer/request-apply-thesis",
	GROUP_PROGRESS: "/lecturer/group-progress",
	GROUP_REVIEW: "/lecturer/group-review",
	// Moderator features
	DASHBOARD_MODERATOR: DASHBOARD_PATHS.LECTURER_DASHBOARD_MODERATOR,
	PUBLISH_THESIS: DASHBOARD_PATHS.LECTURER_ASSIGN_LIST_PUBLISH_THESIS,
	GROUP_MANAGEMENT: DASHBOARD_PATHS.LECTURER_GROUP_MANAGEMENT,
	ASSIGN_SUPERVISOR: DASHBOARD_PATHS.LECTURER_ASSIGN_SUPERVISOR,
	ASSIGN_LECTURER_REVIEW: DASHBOARD_PATHS.LECTURER_ASSIGN_LECTURER_REVIEW,
	CHECKLIST_MANAGEMENT: DASHBOARD_PATHS.LECTURER_CHECKLIST_MANAGEMENT,
	THESES_REGISTRATION: DASHBOARD_PATHS.LECTURER_THESES_REGISTRATION,
} as const;

/**
 * Path mapping configuration for lecturer sidebar
 * Each menu item can have multiple associated paths
 */
export const LECTURER_PATH_MAPPING = {
	[LECTURER_MENU_KEYS.THESIS_MANAGEMENT]: [
		"/lecturer/thesis-management",
		"/lecturer/thesis-details",
		"/lecturer/edit-thesis",
		"/lecturer/thesis-management/create-thesis",
	],
	[LECTURER_MENU_KEYS.REQUEST_APPLY_THESIS]: ["/lecturer/request-apply-thesis"],
	[LECTURER_MENU_KEYS.GROUP_PROGRESS]: [
		"/lecturer/group-progress",
		"/lecturer/group-details",
	],
	[LECTURER_MENU_KEYS.GROUP_REVIEW]: [
		"/lecturer/group-review",
		"/lecturer/group-review/[groupId]",
	],
	[LECTURER_MENU_KEYS.DASHBOARD_MODERATOR]: [
		DASHBOARD_PATHS.LECTURER_DASHBOARD_MODERATOR,
	],
	[LECTURER_MENU_KEYS.PUBLISH_THESIS]: [
		DASHBOARD_PATHS.LECTURER_ASSIGN_LIST_PUBLISH_THESIS,
	],
	[LECTURER_MENU_KEYS.GROUP_MANAGEMENT]: [
		DASHBOARD_PATHS.LECTURER_GROUP_MANAGEMENT,
		"/lecturer/group-management/[groupId]",
	],
	[LECTURER_MENU_KEYS.ASSIGN_SUPERVISOR]: [
		DASHBOARD_PATHS.LECTURER_ASSIGN_SUPERVISOR,
		"/lecturer/supervisor-assignment",
	],
	[LECTURER_MENU_KEYS.ASSIGN_LECTURER_REVIEW]: [
		DASHBOARD_PATHS.LECTURER_ASSIGN_LECTURER_REVIEW,
		"/lecturer/lecturer-review-assignment",
	],
	[LECTURER_MENU_KEYS.CHECKLIST_MANAGEMENT]: [
		DASHBOARD_PATHS.LECTURER_CHECKLIST_MANAGEMENT,
		"/lecturer/checklist-detail",
		"/lecturer/checklist-edit",
		"/lecturer/create-checklist",
	],
	[LECTURER_MENU_KEYS.THESES_REGISTRATION]: [
		DASHBOARD_PATHS.LECTURER_THESES_REGISTRATION,
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
