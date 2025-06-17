import { notification } from 'antd';

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
			notification.error({
				message: 'Connection Error',
				description:
					'Connection timeout. The server may be starting up. Please wait a moment and try again.',
				duration: 5,
				placement: 'bottomRight',
			});
		}
		// Password validation errors
		else if (
			normalizedErrorMessage.includes('password does not meet requirements') ||
			normalizedErrorMessage.includes('password must match') ||
			normalizedErrorMessage.includes('regular expression')
		) {
			notification.error({
				message: 'Password Requirements',
				description:
					'Password requirements not met. Please ensure your password contains at least one uppercase letter, one number, and one special character.',
				duration: 6,
				placement: 'bottomRight',
			});
		}
		// Invalid credentials
		else if (
			normalizedErrorMessage.includes('invalid credentials') ||
			normalizedErrorMessage.includes('incorrect email') ||
			normalizedErrorMessage.includes('invalid')
		) {
			notification.error({
				message: 'Login Failed',
				description: `Incorrect ${isAdmin ? 'username' : 'email'} or password. Please try again.`,
				duration: 4,
				placement: 'bottomRight',
			});
		}
		// Account deactivated
		else if (
			normalizedErrorMessage.includes('deactivated') ||
			normalizedErrorMessage.includes('inactive')
		) {
			notification.error({
				message: 'Account Disabled',
				description:
					'Your account has been deactivated. Please contact support.',
				duration: 6,
				placement: 'bottomRight',
			});
		} // Server errors
		else if (
			normalizedErrorMessage.includes('server error') ||
			normalizedErrorMessage.includes('500')
		) {
			notification.error({
				message: 'Server Error',
				description:
					'Server is temporarily unavailable. Please try again in a few moments.',
				duration: 5,
				placement: 'bottomRight',
			});
		} // Network connection errors
		else if (
			normalizedErrorMessage.includes('cannot connect') ||
			normalizedErrorMessage.includes('econnrefused')
		) {
			notification.error({
				message: 'Connection Error',
				description:
					'Cannot connect to server. Please check your internet connection.',
				duration: 5,
				placement: 'bottomRight',
			});
		} // Rate limiting
		else if (normalizedErrorMessage.includes('too many')) {
			notification.error({
				message: 'Too Many Attempts',
				description:
					'Too many login attempts. Please wait a few minutes and try again.',
				duration: 6,
				placement: 'bottomRight',
			});
		}
		// Default error message
		else {
			notification.error({
				message: 'Login Error',
				description: errorMessage,
				duration: 4,
				placement: 'bottomRight',
			});
		}
	}

	/**
	 * Handle unexpected errors during login process
	 */
	static handleUnexpectedError(error: unknown, isAdmin = false) {
		console.error(`${isAdmin ? 'Admin login' : 'Login'} error:`, error);
		notification.error({
			message: 'Unexpected Error',
			description:
				'An unexpected error occurred. Please try again or contact support.',
			duration: 5,
			placement: 'bottomRight',
		});
	}
}
