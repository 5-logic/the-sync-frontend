import { LoadingOutlined } from '@ant-design/icons';
import { notification } from 'antd';
import React from 'react';

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
	 * Show loading notification (info with loading icon)
	 */
	loading: (
		message: string,
		description?: string,
		options?: { key?: string; duration?: number },
	) => {
		notification.info({
			message,
			description,
			duration: options?.duration ?? 0, // Don't auto dismiss by default
			key: options?.key,
			icon: React.createElement(LoadingOutlined),
		});
	},

	/**
	 * Destroy all notifications
	 */
	destroy: (key?: string) => {
		if (key) {
			notification.destroy(key);
		} else {
			notification.destroy();
		}
	},

	/**
	 * Destroy specific notification by key
	 * @deprecated Use destroy(key) instead
	 */
	destroyByKey: (key: string) => {
		notification.destroy(key);
	},
};
