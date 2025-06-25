import { AxiosError } from 'axios';

import { showNotification } from '@/lib/utils/notification';
import { ApiResponse } from '@/schemas/_common';

interface ApiErrorDetails {
	message: string;
	statusCode: number;
}

export const handleApiResponse = <T>(
	response: ApiResponse<T>,
	title?: string,
	successMessage?: string,
): { success: boolean; data?: T; error?: ApiErrorDetails } => {
	if (response.success) {
		if (successMessage) {
			showNotification.success(title || 'Success', successMessage);
		}
		return { success: true, data: response.data };
	} else {
		const error = {
			message: response.error,
			statusCode: response.statusCode,
		};
		return { success: false, error };
	}
};

export const handleApiError = (
	error: unknown,
	fallbackMessage = 'An unexpected error occurred',
): ApiErrorDetails => {
	console.error('API Error:', error);

	// Nếu là AxiosError và có response
	if (error instanceof AxiosError && error.response?.data) {
		const apiResponse = error.response.data as ApiResponse<unknown>;
		const message =
			apiResponse.success === false && typeof apiResponse.error === 'string'
				? apiResponse.error
				: fallbackMessage;
		return {
			message,
			statusCode: error.response.status,
		};
	}

	// Network error hoặc lỗi khác
	return {
		message: fallbackMessage,
		statusCode: 500,
	};
};
