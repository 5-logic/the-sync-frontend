import { showNotification } from '@/lib/utils/notification';

/**
 * HTTP Status Codes
 */
const HTTP_STATUS = {
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	NOT_FOUND: 404,
	TOO_MANY_REQUESTS: 429,
	INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Notification Duration Constants
 */
const NOTIFICATION_DURATION = {
	SHORT: 3,
	MEDIUM: 4,
	LONG: 5,
	EXTRA_LONG: 6,
} as const;

/**
 * Error Message Keywords
 */
const ERROR_KEYWORDS = {
	INVALID: ['invalid', 'wrong', 'incorrect'],
	EXPIRED: ['expired', 'expire'],
	FORMAT: ['format', 'length', 'digit', 'characters', 'longer', 'shorter'],
	NETWORK: ['network', 'timeout', 'econnaborted', 'econnrefused'],
	VALIDATION: ['validation', 'required', 'must be'],
	FETCH: ['fetch', 'network'],
	ATTEMPT: ['attempt'],
	REQUEST: ['request'],
} as const;

/**
 * 🔢 OTP Verification Error Handler
 * Centralized error handling for OTP verification attempts
 *
 * @description Handles various types of OTP-related errors with appropriate user notifications
 * @version 1.0.0
 */
export class OtpVerificationErrorHandler {
	/**
	 * Handle different types of OTP verification errors with specific notifications
	 *
	 * @param errorMessage - The error message to process
	 * @param statusCode - HTTP status code (optional)
	 */
	static handleOtpError(errorMessage: string, statusCode?: number): void {
		// Normalize error message for case-insensitive comparison
		const normalizedErrorMessage = errorMessage.toLowerCase();

		// Handle based on status code first, then message content
		switch (statusCode) {
			case HTTP_STATUS.BAD_REQUEST:
				OtpVerificationErrorHandler.handle400Error(
					normalizedErrorMessage,
					errorMessage,
				);
				break;
			case HTTP_STATUS.UNAUTHORIZED:
				OtpVerificationErrorHandler.handle401Error(
					normalizedErrorMessage,
					errorMessage,
				);
				break;
			case HTTP_STATUS.NOT_FOUND:
				OtpVerificationErrorHandler.handle404Error();
				break;
			case HTTP_STATUS.TOO_MANY_REQUESTS:
				OtpVerificationErrorHandler.handle429Error(
					normalizedErrorMessage,
					errorMessage,
				);
				break;
			case HTTP_STATUS.INTERNAL_SERVER_ERROR:
				OtpVerificationErrorHandler.handle500Error();
				break;
			default:
				OtpVerificationErrorHandler.handleDefaultError(
					normalizedErrorMessage,
					errorMessage,
				);
				break;
		}
	}

	/**
	 * Check if message contains any of the specified keywords
	 *
	 * @param message - Message to check
	 * @param keywords - Array of keywords to search for
	 * @returns True if any keyword is found
	 */
	private static containsKeyword(
		message: string,
		keywords: readonly string[],
	): boolean {
		return keywords.some((keyword) => message.includes(keyword));
	}

	/**
	 * Handle 400 Bad Request errors
	 *
	 * @param normalizedMessage - Normalized error message
	 * @param originalMessage - Original error message
	 */
	private static handle400Error(
		normalizedMessage: string,
		originalMessage: string,
	): void {
		if (
			OtpVerificationErrorHandler.containsKeyword(
				normalizedMessage,
				ERROR_KEYWORDS.EXPIRED,
			)
		) {
			showNotification.error(
				'Code Expired',
				'Your verification code has expired. Please request a new one to continue.',
				NOTIFICATION_DURATION.LONG,
			);
		} else if (
			OtpVerificationErrorHandler.containsKeyword(
				normalizedMessage,
				ERROR_KEYWORDS.INVALID,
			)
		) {
			showNotification.error(
				'Invalid Code',
				'The verification code you entered is incorrect. Please check your email for the correct 8-digit code.',
				NOTIFICATION_DURATION.MEDIUM,
			);
		} else if (
			normalizedMessage.includes('longer than or equal to 8') ||
			normalizedMessage.includes('must be 8') ||
			normalizedMessage.includes('8 characters')
		) {
			showNotification.error(
				'Code Too Short',
				'Please enter the complete 8-digit verification code from your email.',
				NOTIFICATION_DURATION.MEDIUM,
			);
		} else if (
			OtpVerificationErrorHandler.containsKeyword(
				normalizedMessage,
				ERROR_KEYWORDS.FORMAT,
			)
		) {
			showNotification.error(
				'Invalid Format',
				'Please enter a valid 8-digit verification code.',
				NOTIFICATION_DURATION.MEDIUM,
			);
		} else if (
			OtpVerificationErrorHandler.containsKeyword(
				normalizedMessage,
				ERROR_KEYWORDS.VALIDATION,
			)
		) {
			showNotification.error(
				'Validation Error',
				'The verification code format is invalid. Please enter exactly 8 digits.',
				NOTIFICATION_DURATION.MEDIUM,
			);
		} else {
			showNotification.error(
				'Verification Failed',
				originalMessage || 'Unable to verify the code. Please try again.',
				NOTIFICATION_DURATION.MEDIUM,
			);
		}
	}

	/**
	 * Handle 401 Unauthorized errors
	 *
	 * @param normalizedMessage - Normalized error message
	 * @param originalMessage - Original error message
	 */
	private static handle401Error(
		normalizedMessage: string,
		originalMessage: string,
	): void {
		if (
			OtpVerificationErrorHandler.containsKeyword(
				normalizedMessage,
				ERROR_KEYWORDS.EXPIRED,
			)
		) {
			showNotification.error(
				'Session Expired',
				'Your verification session has expired. Please request a new verification code.',
				NOTIFICATION_DURATION.LONG,
			);
		} else if (
			OtpVerificationErrorHandler.containsKeyword(
				normalizedMessage,
				ERROR_KEYWORDS.INVALID,
			)
		) {
			showNotification.error(
				'Invalid Verification',
				'The verification code is invalid or has already been used. Please request a new one.',
				NOTIFICATION_DURATION.LONG,
			);
		} else {
			showNotification.error(
				'Authentication Failed',
				originalMessage || 'Unable to authenticate the verification code.',
				NOTIFICATION_DURATION.MEDIUM,
			);
		}
	}

	/**
	 * Handle 404 Not Found errors
	 */
	private static handle404Error(): void {
		showNotification.error(
			'Verification Request Not Found',
			'No active verification request found. Please start the process again.',
			NOTIFICATION_DURATION.LONG,
		);
	}

	/**
	 * Handle 429 Too Many Requests errors
	 *
	 * @param normalizedMessage - Normalized error message
	 * @param originalMessage - Original error message
	 */
	private static handle429Error(
		normalizedMessage: string,
		originalMessage: string,
	): void {
		if (
			OtpVerificationErrorHandler.containsKeyword(
				normalizedMessage,
				ERROR_KEYWORDS.ATTEMPT,
			)
		) {
			showNotification.warning(
				'Too Many Attempts',
				'You have made too many verification attempts. Please wait 5 minutes before trying again.',
				NOTIFICATION_DURATION.EXTRA_LONG,
			);
		} else if (
			OtpVerificationErrorHandler.containsKeyword(
				normalizedMessage,
				ERROR_KEYWORDS.REQUEST,
			)
		) {
			showNotification.warning(
				'Rate Limited',
				'Too many verification requests. Please wait a few minutes before requesting a new code.',
				NOTIFICATION_DURATION.EXTRA_LONG,
			);
		} else {
			showNotification.warning(
				'Request Limit Reached',
				originalMessage ||
					'Too many requests. Please wait before trying again.',
				NOTIFICATION_DURATION.EXTRA_LONG,
			);
		}
	}

	/**
	 * Handle 500 Server Error
	 */
	private static handle500Error(): void {
		showNotification.error(
			'Server Error',
			'Our verification service is temporarily unavailable. Please try again in a few moments.',
			NOTIFICATION_DURATION.LONG,
		);
	}

	/**
	 * Handle other error scenarios
	 *
	 * @param normalizedMessage - Normalized error message
	 * @param originalMessage - Original error message
	 */
	private static handleDefaultError(
		normalizedMessage: string,
		originalMessage: string,
	): void {
		if (
			OtpVerificationErrorHandler.containsKeyword(
				normalizedMessage,
				ERROR_KEYWORDS.NETWORK,
			)
		) {
			showNotification.error(
				'Connection Error',
				'Unable to connect to the verification service. Please check your internet connection.',
				NOTIFICATION_DURATION.LONG,
			);
		} else if (
			OtpVerificationErrorHandler.containsKeyword(
				normalizedMessage,
				ERROR_KEYWORDS.FETCH,
			)
		) {
			showNotification.error(
				'Network Error',
				'Failed to communicate with the server. Please try again.',
				NOTIFICATION_DURATION.MEDIUM,
			);
		} else {
			showNotification.error(
				'Verification Error',
				originalMessage || 'An error occurred during OTP verification.',
				NOTIFICATION_DURATION.MEDIUM,
			);
		}
	}

	/**
	 * Handle unexpected errors during OTP verification process
	 *
	 * @param error - The error object
	 */
	static handleUnexpectedError(error: unknown): void {
		console.error('OTP verification unexpected error:', error);

		if (error instanceof Error) {
			if (
				OtpVerificationErrorHandler.containsKeyword(
					error.message.toLowerCase(),
					ERROR_KEYWORDS.NETWORK,
				)
			) {
				showNotification.error(
					'Network Error',
					'Unable to connect to the verification service.',
					NOTIFICATION_DURATION.LONG,
				);
			} else {
				showNotification.error(
					'Unexpected Error',
					`Verification failed: ${error.message}`,
					NOTIFICATION_DURATION.LONG,
				);
			}
		} else {
			showNotification.error(
				'Unexpected Error',
				'An unexpected error occurred during verification. Please try again.',
				NOTIFICATION_DURATION.LONG,
			);
		}
	}

	/**
	 * Handle OTP resend errors
	 *
	 * @param errorMessage - The error message
	 * @param statusCode - HTTP status code (optional)
	 */
	static handleResendError(errorMessage: string, statusCode?: number): void {
		switch (statusCode) {
			case HTTP_STATUS.TOO_MANY_REQUESTS:
				showNotification.warning(
					'Resend Limit Reached',
					'You have requested too many verification codes. Please wait before requesting another one.',
					NOTIFICATION_DURATION.EXTRA_LONG,
				);
				break;
			case HTTP_STATUS.NOT_FOUND:
				showNotification.error(
					'Session Not Found',
					'Your verification session has expired. Please start the process again.',
					NOTIFICATION_DURATION.LONG,
				);
				break;
			case HTTP_STATUS.INTERNAL_SERVER_ERROR:
				showNotification.error(
					'Service Error',
					'Unable to send verification code due to server issues. Please try again later.',
					NOTIFICATION_DURATION.LONG,
				);
				break;
			default:
				showNotification.error(
					'Resend Failed',
					errorMessage ||
						'Unable to resend verification code. Please try again.',
					NOTIFICATION_DURATION.MEDIUM,
				);
				break;
		}
	}
}

// Legacy export for backward compatibility (temporary)
export const OtpErrorHandler = OtpVerificationErrorHandler;
