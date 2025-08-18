export const STUDENT_MENU_KEYS = {
	DASHBOARD: "/student",
	LIST_THESIS: "/student/list-thesis",
	JOIN_GROUP: "/student/join-group",
	APPLY_THESIS_REQUEST: "/student/apply-thesis-request",
	GROUP_DASHBOARD: "/student/group-dashboard",
	TRACK_PROGRESS: "/student/track-progress",
} as const;

export const STUDENT_PATH_MAPPING = {
	[STUDENT_MENU_KEYS.LIST_THESIS]: [
		"/student/list-thesis",
		"/student/thesis-details",
		"/student/view-thesis",
	],
	[STUDENT_MENU_KEYS.JOIN_GROUP]: [
		"/student/join-group",
		"/student/join-or-create-group",
		"/student/join-group",
		"/student/create-group",
		"/student/group-invitation",
	],
	[STUDENT_MENU_KEYS.APPLY_THESIS_REQUEST]: [
		"/student/apply-thesis-request",
		"/student/thesis-registration",
		"/student/submit-thesis",
	],
	[STUDENT_MENU_KEYS.GROUP_DASHBOARD]: [
		"/student/group-dashboard",
		"/student/group-management",
		"/student/group-settings",
	],
	[STUDENT_MENU_KEYS.TRACK_PROGRESS]: [
		"/student/track-progress",
		"/student/progress-details",
		"/student/milestone-tracking",
	],
} as const;

export function getSelectedMenuKey(currentPath: string): string {
	for (const [menuKey, paths] of Object.entries(STUDENT_PATH_MAPPING)) {
		if (paths.some((path) => currentPath.startsWith(path))) {
			return menuKey;
		}
	}
	return currentPath;
}
