import { showNotification } from '@/lib/utils/notification';

/**
 * 🚨 Login Error Handler
 * Centralized error handling for login attempts
 */
export class LoginErrorHandler {
	/**
	 * Handle different types of login errors with specific notifications
	 */
	static handleLoginError(errorMessage: string, isAdmin = false) {
		// Normalize error message for case-insensitive comparison
		const normalizedErrorMessage = errorMessage.toLowerCase();

		// Connection and timeout errors
		if (
			normalizedErrorMessage.includes('timeout') ||
			normalizedErrorMessage.includes('econnaborted')
		) {
			showNotification.error(
				'Connection Error',
				'Connection timeout. The server may be starting up. Please wait a moment and try again.',
				5,
			);
		} // Password validation errors
		else if (
			normalizedErrorMessage.includes('password does not meet requirements') ||
			normalizedErrorMessage.includes('password must match') ||
			normalizedErrorMessage.includes('regular expression')
		) {
			showNotification.error(
				'Password Requirements',
				'Password requirements not met. Please ensure your password contains at least one uppercase letter, one number, and one special character.',
				6,
			);
		}
		// Invalid credentials
		else if (
			normalizedErrorMessage.includes('invalid credentials') ||
			normalizedErrorMessage.includes('incorrect email') ||
			normalizedErrorMessage.includes('invalid')
		) {
			showNotification.error(
				'Login Failed',
				`Incorrect ${isAdmin ? 'username' : 'email'} or password. Please try again.`,
				4,
			);
		}
		// Account deactivated
		else if (
			normalizedErrorMessage.includes('deactivated') ||
			normalizedErrorMessage.includes('inactive')
		) {
			showNotification.error(
				'Account Disabled',
				'Your account has been deactivated. Please contact support.',
				6,
			);
		} // Server errors
		else if (
			normalizedErrorMessage.includes('server error') ||
			normalizedErrorMessage.includes('500')
		) {
			showNotification.error(
				'Server Error',
				'Server is temporarily unavailable. Please try again in a few moments.',
				5,
			);
		} // Network connection errors
		else if (
			normalizedErrorMessage.includes('cannot connect') ||
			normalizedErrorMessage.includes('econnrefused')
		) {
			showNotification.error(
				'Connection Error',
				'Cannot connect to server. Please check your internet connection.',
				5,
			);
		} // Rate limiting
		else if (normalizedErrorMessage.includes('too many')) {
			showNotification.error(
				'Too Many Attempts',
				'Too many login attempts. Please wait a few minutes and try again.',
				6,
			);
		}
		// Default error message
		else {
			showNotification.error('Login Error', errorMessage, 4);
		}
	}
	/**
	 * Handle unexpected errors during login process
	 */
	static handleUnexpectedError(error: unknown, isAdmin = false) {
		console.error(`${isAdmin ? 'Admin login' : 'Login'} error:`, error);
		showNotification.error(
			'Unexpected Error',
			'An unexpected error occurred. Please try again or contact support.',
			5,
		);
	}
}
