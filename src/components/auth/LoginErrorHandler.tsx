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
		// Connection and timeout errors
		if (
			errorMessage.includes('timeout') ||
			errorMessage.includes('ECONNABORTED')
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
			errorMessage.includes('Password does not meet requirements') ||
			errorMessage.includes('password must match') ||
			errorMessage.includes('regular expression')
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
			errorMessage.includes('Invalid credentials') ||
			errorMessage.includes('Incorrect email') ||
			errorMessage.includes('invalid') ||
			errorMessage.includes('Invalid')
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
			errorMessage.includes('deactivated') ||
			errorMessage.includes('inactive')
		) {
			notification.error({
				message: 'Account Disabled',
				description:
					'Your account has been deactivated. Please contact support.',
				duration: 6,
				placement: 'bottomRight',
			});
		}
		// Server errors
		else if (
			errorMessage.includes('Server error') ||
			errorMessage.includes('500')
		) {
			notification.error({
				message: 'Server Error',
				description:
					'Server is temporarily unavailable. Please try again in a few moments.',
				duration: 5,
				placement: 'bottomRight',
			});
		}
		// Network connection errors
		else if (
			errorMessage.includes('Cannot connect') ||
			errorMessage.includes('ECONNREFUSED')
		) {
			notification.error({
				message: 'Connection Error',
				description:
					'Cannot connect to server. Please check your internet connection.',
				duration: 5,
				placement: 'bottomRight',
			});
		}
		// Rate limiting
		else if (errorMessage.includes('Too many')) {
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
