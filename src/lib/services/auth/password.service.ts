import { AxiosError } from 'axios';

import httpClient from '@/lib/services/_httpClient';
import { ApiResponse, PasswordChange } from '@/schemas/_common';

/**
 * Password management service
 * Handles password-related operations for all user types
 */
export class PasswordService {
	/**
	 * Change password for the currently authenticated user
	 * Works for all user types (students, lecturers, admins)
	 */
	static async changePassword(
		passwordData: PasswordChange,
	): Promise<ApiResponse<void>> {
		try {
			const response = await httpClient.put<ApiResponse<void>>(
				'/auth/change-password',
				passwordData,
			);
			return response.data;
		} catch (error) {
			return PasswordService.handleAxiosError(error);
		}
	}

	/**
	 * Request password reset OTP
	 */
	static async requestPasswordReset(
		email: string,
	): Promise<ApiResponse<{ message: string }>> {
		try {
			const response = await httpClient.post<ApiResponse<{ message: string }>>(
				'/auth/password-reset/request',
				{ email },
			);
			return response.data;
		} catch (error) {
			return PasswordService.handleAxiosError(error);
		}
	}

	/**
	 * Verify OTP and reset password
	 */
	static async verifyOtpAndResetPassword(
		email: string,
		otpCode: string,
	): Promise<ApiResponse<{ message: string }>> {
		try {
			const response = await httpClient.post<ApiResponse<{ message: string }>>(
				'/auth/password-reset/verify',
				{ email, otpCode },
			);
			return response.data;
		} catch (error) {
			return PasswordService.handleAxiosError(error);
		}
	}

	/**
	 * Handle Axios errors and convert them to ApiResponse format
	 */
	private static handleAxiosError(error: unknown): ApiResponse<never> {
		console.error('PasswordService error:', error);

		if (error instanceof Error && 'response' in error) {
			const axiosError = error as AxiosError;
			const errorData = axiosError.response?.data as Record<string, unknown>;

			// If backend returns a structured error response
			if (errorData && typeof errorData === 'object') {
				return {
					success: false,
					statusCode: axiosError.response?.status || 500,
					error:
						(errorData.error as string) ||
						(errorData.message as string) ||
						'An error occurred',
				};
			}

			// Fallback for unstructured errors
			return {
				success: false,
				statusCode: axiosError.response?.status || 500,
				error: axiosError.message || 'An error occurred',
			};
		}

		// Handle non-Axios errors
		return {
			success: false,
			statusCode: 500,
			error:
				error instanceof Error ? error.message : 'An unexpected error occurred',
		};
	}
}

export default PasswordService;
