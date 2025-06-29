import { notification } from 'antd';

/**
 * Configure global notification settings
 * All notifications will appear at top-right corner
 */
export const configureNotification = () => {
	notification.config({
		placement: 'topRight',
		top: 24,
		duration: 4.5,
		maxCount: 3,
		rtl: false,
	});
};

/**
 * Utility functions for consistent notification usage
 */
export const showNotification = {
	success: (message: string, description?: string, duration?: number) => {
		notification.success({
			message,
			description,
			duration,
		});
	},

	error: (message: string, description?: string, duration?: number) => {
		notification.error({
			message,
			description,
			duration,
		});
	},

	warning: (message: string, description?: string, duration?: number) => {
		notification.warning({
			message,
			description,
			duration,
		});
	},

	info: (message: string, description?: string, duration?: number) => {
		notification.info({
			message,
			description,
			duration,
		});
	},

	/**
	 * Destroy all notifications
	 */
	destroy: () => {
		notification.destroy();
	},

	/**
	 * Destroy specific notification by key
	 */
	destroyByKey: (key: string) => {
		notification.destroy(key);
	},
};
