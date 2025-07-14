import { showNotification } from '@/lib/utils/notification';

/**
 * 🚨 Password Reset Error Handler
 * Centralized error handling for password reset flow
 */
export class PasswordResetErrorHandler {
	/**
	 * Handle different types of password reset errors with specific notifications
	 */
	static handlePasswordResetError(errorMessage: string, statusCode?: number) {
		// Normalize error message for case-insensitive comparison
		const normalizedErrorMessage = errorMessage.toLowerCase();

		// Handle based on status code first, then message content
		switch (statusCode) {
			case 400:
				PasswordResetErrorHandler.handle400Error(
					normalizedErrorMessage,
					errorMessage,
				);
				break;
			case 401:
				PasswordResetErrorHandler.handle401Error(
					normalizedErrorMessage,
					errorMessage,
				);
				break;
			case 404:
				PasswordResetErrorHandler.handle404Error(
					normalizedErrorMessage,
					errorMessage,
				);
				break;
			case 429:
				PasswordResetErrorHandler.handle429Error(
					normalizedErrorMessage,
					errorMessage,
				);
				break;
			case 500:
				PasswordResetErrorHandler.handle500Error();
				break;
			default:
				PasswordResetErrorHandler.handleDefaultError(
					normalizedErrorMessage,
					errorMessage,
				);
				break;
		}
	}

	/**
	 * Handle 400 Bad Request errors
	 */
	private static handle400Error(
		normalizedMessage: string,
		originalMessage: string,
	) {
		// Email validation errors
		if (
			normalizedMessage.includes('invalid email') ||
			normalizedMessage.includes('email format') ||
			normalizedMessage.includes('email is required')
		) {
			showNotification.error(
				'Invalid Email',
				'Please enter a valid email address.',
				4,
			);
		}
		// OTP validation errors
		else if (
			normalizedMessage.includes('invalid otp') ||
			normalizedMessage.includes('wrong code') ||
			normalizedMessage.includes('incorrect code')
		) {
			showNotification.error(
				'Invalid Verification Code',
				'The verification code you entered is incorrect. Please check and try again.',
				4,
			);
		}
		// OTP expired errors
		else if (
			normalizedMessage.includes('expired') ||
			normalizedMessage.includes('expire')
		) {
			showNotification.error(
				'Code Expired',
				'Your verification code has expired. Please request a new one.',
				5,
			);
		}
		// OTP format errors
		else if (
			normalizedMessage.includes('code must be') ||
			normalizedMessage.includes('8 digits') ||
			normalizedMessage.includes('format')
		) {
			showNotification.error(
				'Invalid Format',
				'Please enter a valid 8-digit verification code.',
				4,
			);
		}
		// General validation errors
		else {
			showNotification.error(
				'Validation Error',
				originalMessage || 'Please check your input and try again.',
				4,
			);
		}
	}

	/**
	 * Handle 401 Unauthorized errors
	 */
	private static handle401Error(
		normalizedMessage: string,
		originalMessage: string,
	) {
		// OTP expired/invalid
		if (
			normalizedMessage.includes('expired') ||
			normalizedMessage.includes('expire')
		) {
			showNotification.error(
				'Verification Code Expired',
				'Your verification code has expired. Please request a new one to continue.',
				5,
			);
		}
		// Invalid OTP
		else if (
			normalizedMessage.includes('invalid') ||
			normalizedMessage.includes('unauthorized')
		) {
			showNotification.error(
				'Invalid Verification Code',
				'The verification code is invalid. Please check your email for the correct code.',
				4,
			);
		}
		// Session expired
		else if (normalizedMessage.includes('session')) {
			showNotification.error(
				'Session Expired',
				'Your session has expired. Please start the password reset process again.',
				5,
			);
		}
		// General unauthorized
		else {
			showNotification.error(
				'Authentication Failed',
				originalMessage || 'Unable to verify your identity. Please try again.',
				4,
			);
		}
	}

	/**
	 * Handle 404 Not Found errors
	 */
	private static handle404Error(
		normalizedMessage: string,
		originalMessage: string,
	) {
		// User not found
		if (
			normalizedMessage.includes('user not found') ||
			normalizedMessage.includes('email not found') ||
			normalizedMessage.includes('account not found')
		) {
			showNotification.error(
				'Email Not Found',
				'No account found with this email address. Please check the email and try again.',
				5,
			);
		}
		// Reset request not found
		else if (
			normalizedMessage.includes('reset request') ||
			normalizedMessage.includes('request not found')
		) {
			showNotification.error(
				'Reset Request Not Found',
				'No active password reset request found. Please request a new verification code.',
				5,
			);
		}
		// General not found
		else {
			showNotification.error(
				'Not Found',
				originalMessage || 'The requested resource was not found.',
				4,
			);
		}
	}

	/**
	 * Handle 429 Too Many Requests errors
	 */
	private static handle429Error(
		normalizedMessage: string,
		originalMessage: string,
	) {
		// Too many OTP requests
		if (
			normalizedMessage.includes('too many requests') ||
			normalizedMessage.includes('rate limit')
		) {
			showNotification.warning(
				'Too Many Requests',
				'You have requested too many verification codes. Please wait a few minutes before trying again.',
				6,
			);
		}
		// Too many verification attempts
		else if (
			normalizedMessage.includes('too many attempts') ||
			normalizedMessage.includes('attempt limit')
		) {
			showNotification.warning(
				'Too Many Attempts',
				'You have made too many verification attempts. Please wait before trying again.',
				6,
			);
		}
		// General rate limiting
		else {
			showNotification.warning(
				'Rate Limited',
				originalMessage ||
					'Too many requests. Please wait a few minutes before trying again.',
				6,
			);
		}
	}

	/**
	 * Handle 500 Server Error
	 */
	private static handle500Error() {
		showNotification.error(
			'Server Error',
			'Our servers are experiencing issues. Please try again in a few moments.',
			5,
		);
	}

	/**
	 * Handle other error scenarios
	 */
	private static handleDefaultError(
		normalizedMessage: string,
		originalMessage: string,
	) {
		// Connection and timeout errors
		if (
			normalizedMessage.includes('timeout') ||
			normalizedMessage.includes('econnaborted')
		) {
			showNotification.error(
				'Connection Timeout',
				'Connection timeout. The server may be starting up. Please wait a moment and try again.',
				5,
			);
		}
		// Network connection errors
		else if (
			normalizedMessage.includes('network') ||
			normalizedMessage.includes('econnrefused') ||
			normalizedMessage.includes('cannot connect')
		) {
			showNotification.error(
				'Connection Error',
				'Cannot connect to server. Please check your internet connection and try again.',
				5,
			);
		}
		// Email service errors
		else if (
			normalizedMessage.includes('email service') ||
			normalizedMessage.includes('mail server') ||
			normalizedMessage.includes('smtp')
		) {
			showNotification.error(
				'Email Service Error',
				'Unable to send email. Please try again later or contact support.',
				5,
			);
		}
		// Password policy errors
		else if (
			normalizedMessage.includes('password policy') ||
			normalizedMessage.includes('password requirements')
		) {
			showNotification.error(
				'Password Policy',
				'Password does not meet security requirements. Please ensure it contains uppercase, lowercase, numbers, and special characters.',
				6,
			);
		}
		// Generic error fallback
		else {
			showNotification.error(
				'Password Reset Error',
				originalMessage ||
					'An error occurred during password reset. Please try again.',
				4,
			);
		}
	}

	/**
	 * Handle unexpected errors during password reset process
	 */
	static handleUnexpectedError(error: unknown, context = 'Password reset') {
		console.error(`${context} unexpected error:`, error);

		if (error instanceof Error) {
			// Check for specific error types
			if (
				error.message.includes('fetch') ||
				error.message.includes('network')
			) {
				showNotification.error(
					'Network Error',
					'Unable to connect to the server. Please check your internet connection.',
					5,
				);
			} else if (error.message.includes('timeout')) {
				showNotification.error(
					'Request Timeout',
					'The request took too long to complete. Please try again.',
					5,
				);
			} else {
				showNotification.error(
					'Unexpected Error',
					`${context} failed: ${error.message}`,
					5,
				);
			}
		} else {
			showNotification.error(
				'Unexpected Error',
				`An unexpected error occurred during ${context.toLowerCase()}. Please try again.`,
				5,
			);
		}
	}

	/**
	 * Handle email sending errors specifically
	 */
	static handleEmailError(errorMessage: string, statusCode?: number) {
		const normalizedMessage = errorMessage.toLowerCase();

		switch (statusCode) {
			case 404:
				showNotification.error(
					'Email Not Found',
					'No account found with this email address. Please check and try again.',
					5,
				);
				break;
			case 429:
				showNotification.warning(
					'Too Many Email Requests',
					'You have requested too many verification emails. Please wait before requesting another one.',
					6,
				);
				break;
			case 500:
				showNotification.error(
					'Email Service Error',
					'Unable to send verification email due to server issues. Please try again later.',
					5,
				);
				break;
			default:
				if (normalizedMessage.includes('email')) {
					showNotification.error(
						'Email Error',
						errorMessage ||
							'Unable to send verification email. Please try again.',
						4,
					);
				} else {
					PasswordResetErrorHandler.handlePasswordResetError(
						errorMessage,
						statusCode,
					);
				}
				break;
		}
	}

	/**
	 * Handle OTP verification errors specifically
	 */
	static handleOtpError(errorMessage: string, statusCode?: number) {
		const normalizedMessage = errorMessage.toLowerCase();

		// Use specific OTP error messages
		switch (statusCode) {
			case 400:
				if (normalizedMessage.includes('expired')) {
					showNotification.error(
						'Code Expired',
						'Your verification code has expired. Please request a new one.',
						5,
					);
				} else if (normalizedMessage.includes('invalid')) {
					showNotification.error(
						'Invalid Code',
						'The verification code is incorrect. Please check and try again.',
						4,
					);
				} else {
					showNotification.error(
						'Verification Error',
						errorMessage || 'Unable to verify the code. Please try again.',
						4,
					);
				}
				break;
			case 401:
				showNotification.error(
					'Code Expired',
					'Your verification code has expired. Please request a new one.',
					5,
				);
				break;
			case 429:
				showNotification.warning(
					'Too Many Attempts',
					'You have made too many verification attempts. Please wait before trying again.',
					6,
				);
				break;
			default:
				PasswordResetErrorHandler.handlePasswordResetError(
					errorMessage,
					statusCode,
				);
				break;
		}
	}
}

// Legacy export for backward compatibility (temporary)
export const ForgotPasswordErrorHandler = PasswordResetErrorHandler;
