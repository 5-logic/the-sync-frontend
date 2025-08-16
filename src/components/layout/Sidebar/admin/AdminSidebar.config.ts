/**
 * Admin sidebar path mapping configuration
 * Maps multiple routes to their corresponding menu keys for proper highlighting
 */

export const ADMIN_MENU_KEYS = {
	DASHBOARD: "/admin",
	STUDENTS_MANAGEMENT: "/admin/students-management",
	GROUP_MANAGEMENT: "/admin/group-management",
	LECTURER_MANAGEMENT: "/admin/lecturer-management",
	MILESTONE_MANAGEMENT: "/admin/milestone-management",
	CAPSTONE_DEFENSE: "/admin/capstone-defense-results",
	SEMESTER_SETTINGS: "/admin/semester-settings",
} as const;

/**
 * Path mapping configuration for admin sidebar
 * Each menu item can have multiple associated paths
 */
export const ADMIN_PATH_MAPPING = {
	[ADMIN_MENU_KEYS.STUDENTS_MANAGEMENT]: [
		"/admin/students-management",
		"/admin/create-new-student",
	],
	[ADMIN_MENU_KEYS.GROUP_MANAGEMENT]: ["/admin/group-management"],
	[ADMIN_MENU_KEYS.LECTURER_MANAGEMENT]: [
		"/admin/lecturer-management",
		"/admin/create-new-lecturer",
	],
	[ADMIN_MENU_KEYS.MILESTONE_MANAGEMENT]: ["/admin/milestone-management"],
	[ADMIN_MENU_KEYS.CAPSTONE_DEFENSE]: ["/admin/capstone-defense-results"],
	[ADMIN_MENU_KEYS.SEMESTER_SETTINGS]: ["/admin/semester-settings"],
} as const;

/**
 * Determines the selected menu key based on the current path
 * @param currentPath - The current pathname
 * @returns The menu key that should be highlighted
 */
export function getSelectedMenuKey(currentPath: string): string {
	// Check each menu item's associated paths
	for (const [menuKey, paths] of Object.entries(ADMIN_PATH_MAPPING)) {
		if (paths.some((path) => currentPath.startsWith(path))) {
			return menuKey;
		}
	}

	// Default to exact path if no mapping found
	return currentPath;
}
