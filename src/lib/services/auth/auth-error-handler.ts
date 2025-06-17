import { AxiosError } from 'axios';

/**
 * 🚨 Auth Error Handler
 * Centralized error handling for authentication services
 */
export class AuthErrorHandler {
	/**
	 * Handle login-specific errors with user-friendly messages
	 */
	static handleLoginError(error: unknown): never {
		console.error('❌ Login failed:', error);

		// Connection timeout
		if (
			error &&
			typeof error === 'object' &&
			'code' in error &&
			error.code === 'ECONNABORTED'
		) {
			throw new Error(
				'Connection timeout. The server may be starting up. Please wait a moment and try again.',
			);
		}
		// Axios response errors
		if (error && typeof error === 'object' && 'response' in error) {
			const axiosError = error as AxiosError;
			const status = axiosError.response?.status;
			const responseData = axiosError.response?.data as {
				error?: string;
				message?: string;
				[key: string]: unknown;
			}; // Handle different HTTP status codes
			switch (status) {
				case 400:
					// Check if it's a password validation error
					if (responseData?.error && Array.isArray(responseData.error)) {
						const errorArray = responseData.error as string[];
						const passwordError = errorArray.find(
							(err: string) =>
								err.includes('password must match') ||
								err.includes('regular expression'),
						);
						if (passwordError) {
							throw new Error(
								'Password does not meet requirements. Please ensure your password contains at least one uppercase letter, one number, and one special character.',
							);
						}
						// Handle other validation errors
						const firstError = errorArray[0];
						if (firstError) {
							throw new Error(`Validation error: ${firstError}`);
						}
					}
					// Check if it's a single error message
					if (responseData?.error && typeof responseData.error === 'string') {
						if (responseData.error.includes('password must match')) {
							throw new Error(
								'Password does not meet requirements. Please ensure your password contains at least one uppercase letter, one number, and one special character.',
							);
						}
						throw new Error(responseData.error);
					}
					// Generic 400 error
					throw new Error(
						'Invalid login data. Please check your input and try again.',
					);

				case 401:
					// Check if the error message indicates specific issues
					if (responseData?.error === 'Not authorized') {
						throw new Error(
							'Incorrect email/username or password. Please try again.',
						);
					}
					if (responseData?.message?.includes('inactive')) {
						throw new Error(
							'Your account has been deactivated. Please contact support.',
						);
					}
					throw new Error(
						'Invalid credentials. Please check your email/username and password.',
					);

				case 403:
					throw new Error(
						'Access denied. You do not have permission to login.',
					);

				case 404:
					throw new Error('Login service not found. Please contact support.');

				case 429:
					throw new Error(
						'Too many login attempts. Please wait a few minutes and try again.',
					);

				case 500:
					throw new Error('Server error. Please try again in a few moments.');

				case 502:
				case 503:
				case 504:
					throw new Error(
						'Service temporarily unavailable. Please try again later.',
					);

				default:
					break;
			}

			// Try to extract error message from response
			if (responseData?.message) {
				throw new Error(responseData.message);
			}

			if (responseData?.error) {
				throw new Error(responseData.error);
			}
		}
		// Network or other errors
		if (error && typeof error === 'object' && 'code' in error) {
			const networkError = error as { code: string; [key: string]: unknown };
			switch (networkError.code) {
				case 'ENOTFOUND':
				case 'ECONNREFUSED':
					throw new Error(
						'Cannot connect to server. Please check your internet connection.',
					);

				case 'ETIMEDOUT':
					throw new Error('Request timed out. Please try again.');

				default:
					break;
			}
		}
		// Fallback error message
		const errorMessage =
			error instanceof Error ? error.message : 'Login failed unexpectedly';
		throw new Error(errorMessage);
	}

	/**
	 * Handle refresh token-specific errors
	 */
	static handleRefreshError(error: unknown): never {
		console.error('❌ Refresh failed:', error);

		// Connection timeout
		if (
			error &&
			typeof error === 'object' &&
			'code' in error &&
			error.code === 'ECONNABORTED'
		) {
			throw new Error(
				'Connection timeout - Backend server may be sleeping. Please wait and try again.',
			);
		}

		// Axios response errors
		if (error && typeof error === 'object' && 'response' in error) {
			const axiosError = error as AxiosError;
			const status = axiosError.response?.status;

			if (status === 404) {
				throw new Error(
					'Refresh endpoint not found - Backend may not support token refresh',
				);
			}

			if (status === 401) {
				throw new Error('Refresh token invalid or expired');
			}

			if (status && status >= 500) {
				throw new Error('Server error - Please try again later');
			}

			if (
				axiosError.response?.data &&
				typeof axiosError.response.data === 'object' &&
				'message' in axiosError.response.data
			) {
				throw new Error(String(axiosError.response.data.message));
			}
		}

		const errorMessage =
			error instanceof Error ? error.message : 'Refresh failed';
		throw new Error(errorMessage);
	}
}
