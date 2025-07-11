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
		const response = await httpClient.put<ApiResponse<void>>(
			'/auth/change-password',
			passwordData,
		);
		return response.data;
	}

	/**
	 * Request password reset (if needed in the future)
	 */
	static async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
		const response = await httpClient.post<ApiResponse<void>>(
			'/auth/forgot-password',
			{ email },
		);
		return response.data;
	}

	/**
	 * Reset password with token (if needed in the future)
	 */
	static async resetPassword(
		token: string,
		newPassword: string,
	): Promise<ApiResponse<void>> {
		const response = await httpClient.post<ApiResponse<void>>(
			'/auth/reset-password',
			{ token, newPassword },
		);
		return response.data;
	}
}

export default PasswordService;
