// User roles
export const USER_ROLES = {
	STUDENT: 'student',
	LECTURER: 'lecturer',
	MODERATOR: 'moderator',
	ADMIN: 'admin',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Route paths
export const DASHBOARD_PATHS = {
	STUDENT: '/student',
	LECTURER: '/lecturer',
	ADMIN: '/admin',
	LECTURER_ASSIGN_STUDENT_LIST: '/lecturer/assign-student-list',
	LECTURER_ASSIGN_STUDENT_DETAIL: '/lecturer/assign-student-detail',
	LECTURER_ASSIGN_SUPERVISOR: '/lecturer/assign-supervisor',
} as const;

// Auth messages
export const AUTH_MESSAGES = {
	LOADING: {
		VERIFYING: 'Verifying access...',
		VERIFYING_DESC: 'Please wait while we check your permissions',
		REDIRECTING: 'Redirecting...',
		REDIRECTING_DESC: 'Taking you to the appropriate page',
	},
	DASHBOARD: {
		STUDENT_LOADING: 'Loading student dashboard...',
		STUDENT_LOADING_DESC: 'Please wait while we prepare your dashboard',
		LECTURER_LOADING: 'Loading lecturer dashboard...',
		LECTURER_LOADING_DESC: 'Please wait while we prepare your teaching tools',
		ADMIN_LOADING: 'Loading admin dashboard...',
		ADMIN_LOADING_DESC: 'Preparing system administration panel',
	},
	ERROR: {
		AUTH_REQUIRED: 'Authentication required',
		ACCESS_DENIED: 'Access denied',
		INSUFFICIENT_PRIVILEGES: 'Insufficient privileges',
	},
} as const;
