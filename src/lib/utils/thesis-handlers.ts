import { showNotification } from '@/lib/utils/notification';

export interface ErrorConfig {
	logMessage: string;
	userMessage: string;
	title?: string;
}

export interface SuccessConfig {
	title: string;
	message: string;
	onSuccess?: () => void;
	redirectTo?: string;
	redirectDelay?: number;
}

/**
 * Centralized error handler for thesis operations
 */
export const handleThesisError = (
	error: unknown,
	config: ErrorConfig,
	setLoading?: (loading: boolean) => void,
) => {
	// Log error for debugging (should be replaced with proper logging service in production)
	if (process.env.NODE_ENV === 'development') {
		console.error(config.logMessage, error);
	}

	// Show user-friendly notification
	showNotification.error(config.title || 'Error', config.userMessage);

	// Reset loading state if provided
	if (setLoading) {
		setLoading(false);
	}
};

/**
 * Centralized success handler for thesis operations
 */
export const handleThesisSuccess = (
	config: SuccessConfig,
	router?: { push: (path: string) => void },
) => {
	// Show success notification
	showNotification.success(config.title, config.message);

	// Execute custom callback if provided
	if (config.onSuccess) {
		config.onSuccess();
	}

	// Handle redirect if specified
	if (config.redirectTo && router) {
		setTimeout(() => {
			router.push(config.redirectTo!);
		}, config.redirectDelay || 1000);
	}
};

/**
 * Common error configurations for thesis operations
 */
export const THESIS_ERROR_CONFIGS = {
	FETCH: {
		logMessage: 'Failed to fetch thesis data:',
		userMessage: 'Failed to load data. Please try again.',
		title: 'Loading Error',
	},
	SUBMIT: {
		logMessage: 'Failed to submit thesis:',
		userMessage: 'Failed to submit thesis. Please try again.',
		title: 'Submit Failed',
	},
	DELETE: {
		logMessage: 'Failed to delete thesis:',
		userMessage: 'Failed to delete thesis. Please try again.',
		title: 'Delete Failed',
	},
	UPDATE: {
		logMessage: 'Failed to update thesis:',
		userMessage: 'Failed to update thesis. Please try again.',
		title: 'Update Failed',
	},
	APPROVE: {
		logMessage: 'Failed to approve thesis:',
		userMessage: 'Failed to approve thesis. Please try again.',
		title: 'Approve Failed',
	},
	REJECT: {
		logMessage: 'Failed to reject thesis:',
		userMessage: 'Failed to reject thesis. Please try again.',
		title: 'Reject Failed',
	},
	CREATE: {
		logMessage: 'Failed to create thesis:',
		userMessage: 'Failed to create thesis. Please try again.',
		title: 'Create Failed',
	},
} as const;

/**
 * Common success configurations for thesis operations
 */
export const THESIS_SUCCESS_CONFIGS = {
	SUBMIT: {
		title: 'Thesis Submitted',
		message: 'Your thesis has been submitted successfully for review.',
		redirectTo: '/lecturer/thesis-management',
	},
	DELETE: {
		title: 'Success',
		message: 'Thesis deleted successfully!',
		redirectTo: '/lecturer/thesis-management',
	},
	UPDATE: {
		title: 'Success',
		message: 'Thesis updated successfully!',
		redirectTo: '/lecturer/thesis-management',
	},
	APPROVE: {
		title: 'Thesis Approved',
		message: 'The thesis has been approved successfully.',
		redirectTo: '/lecturer/thesis-management',
	},
	REJECT: {
		title: 'Thesis Rejected',
		message: 'The thesis has been rejected successfully.',
		redirectTo: '/lecturer/thesis-management',
	},
	CREATE: {
		title: 'Success',
		message: 'Thesis created successfully!',
		redirectTo: '/lecturer/thesis-management',
	},
} as const;
