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
 * Factory function to create error configurations
 */
const createErrorConfig = (action: string, title?: string): ErrorConfig => ({
	logMessage: `Failed to ${action.toLowerCase()} thesis:`,
	userMessage: `Failed to ${action.toLowerCase()} thesis. Please try again.`,
	title: title || `${action} Failed`,
});

/**
 * Factory function to create success configurations
 */
const createSuccessConfig = (
	title: string,
	message: string,
	redirectTo: string = '/lecturer/thesis-management',
): SuccessConfig => ({
	title,
	message,
	redirectTo,
});

/**
 * Error configuration data
 */
interface ErrorConfigData {
	key: string;
	action: string;
	title?: string;
}

const ERROR_CONFIG_DATA: ErrorConfigData[] = [
	{ key: 'FETCH', action: 'fetch', title: 'Loading Error' },
	{ key: 'SUBMIT', action: 'submit' },
	{ key: 'DELETE', action: 'delete' },
	{ key: 'UPDATE', action: 'update' },
	{ key: 'APPROVE', action: 'approve' },
	{ key: 'REJECT', action: 'reject' },
	{ key: 'CREATE', action: 'create' },
];

/**
 * Success configuration data
 */
interface SuccessConfigData {
	key: string;
	title: string;
	message: string;
}

const SUCCESS_CONFIG_DATA: SuccessConfigData[] = [
	{
		key: 'SUBMIT',
		title: 'Thesis Submitted',
		message: 'Your thesis has been submitted successfully for review.',
	},
	{ key: 'DELETE', title: 'Success', message: 'Thesis deleted successfully!' },
	{ key: 'UPDATE', title: 'Success', message: 'Thesis updated successfully!' },
	{
		key: 'APPROVE',
		title: 'Thesis Approved',
		message: 'The thesis has been approved successfully.',
	},
	{
		key: 'REJECT',
		title: 'Thesis Rejected',
		message: 'The thesis has been rejected successfully.',
	},
	{ key: 'CREATE', title: 'Success', message: 'Thesis created successfully!' },
];

/**
 * Common error configurations for thesis operations
 */
export const THESIS_ERROR_CONFIGS = ERROR_CONFIG_DATA.reduce(
	(acc, { key, action, title }) => {
		// Handle special case for FETCH with different user message
		if (key === 'FETCH') {
			acc[key] = {
				logMessage: 'Failed to fetch thesis data:',
				userMessage: 'Failed to load data. Please try again.',
				title: 'Loading Error',
			};
		} else {
			acc[key] = createErrorConfig(action, title);
		}
		return acc;
	},
	{} as Record<string, ErrorConfig>,
);

/**
 * Common success configurations for thesis operations
 */
export const THESIS_SUCCESS_CONFIGS = SUCCESS_CONFIG_DATA.reduce(
	(acc, { key, title, message }) => {
		acc[key] = createSuccessConfig(title, message);
		return acc;
	},
	{} as Record<string, SuccessConfig>,
);
