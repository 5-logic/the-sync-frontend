import { useRouter } from 'next/navigation';

import { showNotification } from '@/lib/utils/notification';

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
 * Default Redirect Delay
 */
const DEFAULT_REDIRECT_DELAY = 3000;

/**
 * Step Types for OTP Flow
 */
type OtpStep = 'email' | 'otp' | 'success';

/**
 * Admin Action Types
 */
type AdminAction = 'password-reset' | 'otp-verified' | 'account-recovered';

/**
 * ✅ OTP Verification Success Handler
 * Handles successful OTP operations and user guidance
 *
 * @description Provides centralized success handling for OTP-related operations
 * @version 1.0.0
 */
export class OtpVerificationSuccessHandler {
	/**
	 * Handle successful OTP email request
	 *
	 * @param email - The email address where OTP was sent
	 */
	static handleOtpSentSuccess(email: string): void {
		showNotification.success(
			'OTP Sent Successfully',
			`📧 We've sent an 8-digit verification code to ${email}. Please check your email inbox and spam folder.`,
			NOTIFICATION_DURATION.LONG,
		);
	}

	/**
	 * Handle successful OTP resend
	 *
	 * @param email - The email address where OTP was resent
	 */
	static handleOtpResendSuccess(email: string): void {
		showNotification.success(
			'New Code Sent',
			`📧 A new verification code has been sent to ${email}. The previous code is no longer valid.`,
			NOTIFICATION_DURATION.MEDIUM,
		);
	}

	/**
	 * Handle successful OTP verification and password reset
	 *
	 * @param email - The email address
	 * @param router - Next.js router instance
	 * @param autoRedirect - Whether to auto-redirect (default: true)
	 * @param redirectDelay - Delay before redirect in milliseconds
	 */
	static handlePasswordResetSuccess(
		email: string,
		router: ReturnType<typeof useRouter>,
		autoRedirect = true,
		redirectDelay = DEFAULT_REDIRECT_DELAY,
	): void {
		showNotification.success(
			'Password Reset Successful',
			`🎉 Your password has been reset successfully! A new temporary password has been sent to ${email}.`,
			NOTIFICATION_DURATION.EXTRA_LONG,
		);

		if (autoRedirect) {
			setTimeout(() => {
				OtpVerificationSuccessHandler.redirectToLogin(router, email);
			}, redirectDelay);
		}
	}

	/**
	 * Handle successful OTP verification only (without password reset)
	 *
	 * @param email - The email address
	 */
	static handleOtpVerificationSuccess(email: string): void {
		showNotification.success(
			'Code Verified Successfully',
			`✅ Verification code confirmed for ${email}. Processing your password reset...`,
			NOTIFICATION_DURATION.MEDIUM,
		);
	}

	/**
	 * Redirect to login page with success context
	 *
	 * @param router - Next.js router instance
	 * @param email - The email address (optional)
	 * @param showNotificationOnRedirect - Whether to show notification on redirect
	 */
	static redirectToLogin(
		router: ReturnType<typeof useRouter>,
		email?: string,
		showNotificationOnRedirect = true,
	): void {
		if (showNotificationOnRedirect && email) {
			showNotification.info(
				'Use Your New Password',
				`Please log in with the new temporary password sent to ${email}. Remember to change it after logging in.`,
				NOTIFICATION_DURATION.LONG,
			);
		}

		router.push('/login');
	}

	/**
	 * Handle successful email change in forgot password flow
	 *
	 * @param newEmail - The new email address
	 */
	static handleEmailChangeSuccess(newEmail: string): void {
		showNotification.success(
			'Email Updated',
			`📧 Email address updated to ${newEmail}. A new verification code will be sent.`,
			NOTIFICATION_DURATION.MEDIUM,
		);
	}

	/**
	 * Handle successful step completion with progress indication
	 *
	 * @param step - The current step in the OTP flow
	 * @param email - The email address
	 * @param additionalInfo - Additional information (optional)
	 */
	static handleStepCompletion(
		step: OtpStep,
		email: string,
		additionalInfo?: string,
	): void {
		let title = '';
		let message = '';

		switch (step) {
			case 'email':
				title = 'Email Verified';
				message = `📧 Verification code sent to ${email}. Please check your inbox.`;
				break;
			case 'otp':
				title = 'Code Verified';
				message = `✅ Verification successful for ${email}. Proceeding to password reset...`;
				break;
			case 'success':
				title = 'Reset Complete';
				message = `🎉 Password reset completed for ${email}. ${additionalInfo || 'You can now log in with your new password.'}`;
				break;
		}

		showNotification.success(title, message, NOTIFICATION_DURATION.MEDIUM);
	}

	/**
	 * Handle general success with custom message
	 *
	 * @param title - Notification title
	 * @param message - Notification message
	 * @param duration - Display duration
	 * @param emoji - Optional emoji prefix
	 */
	static handleCustomSuccess(
		title: string,
		message: string,
		duration = NOTIFICATION_DURATION.MEDIUM,
		emoji?: string,
	): void {
		const finalMessage = emoji ? `${emoji} ${message}` : message;
		showNotification.success(title, finalMessage, duration);
	}

	/**
	 * Handle success with progress tracking
	 *
	 * @param currentStep - Current step number
	 * @param totalSteps - Total number of steps
	 * @param stepName - Name of the current step
	 * @param description - Step description
	 */
	static handleProgressSuccess(
		currentStep: number,
		totalSteps: number,
		stepName: string,
		description: string,
	): void {
		const progressText = `Step ${currentStep}/${totalSteps} completed`;
		showNotification.success(
			`${stepName} - ${progressText}`,
			`✅ ${description}`,
			NOTIFICATION_DURATION.SHORT,
		);
	}

	/**
	 * Handle successful completion with security reminder
	 *
	 * @param email - The email address
	 * @param includeSecurityTips - Whether to include security tips
	 */
	static handleSecuritySuccess(
		email: string,
		includeSecurityTips = true,
	): void {
		const baseMessage = `OTP verification completed successfully for ${email}.`;
		const securityMessage = includeSecurityTips
			? `${baseMessage} Please ensure you keep your new password secure.`
			: baseMessage;

		showNotification.success(
			'🔐 Verification Complete',
			securityMessage,
			NOTIFICATION_DURATION.EXTRA_LONG,
		);
	}

	/**
	 * Handle admin-specific success scenarios
	 *
	 * @param adminEmail - Admin email address
	 * @param action - Type of admin action completed
	 * @param includeSecurityNotice - Whether to include enhanced security notice
	 */
	static handleAdminSuccess(
		adminEmail: string,
		action: AdminAction,
		includeSecurityNotice = true,
	): void {
		let title = '';
		let message = '';

		switch (action) {
			case 'password-reset':
				title = '🛡️ Admin Password Reset Complete';
				message = `Admin password reset completed for ${adminEmail}.`;
				break;
			case 'otp-verified':
				title = '🛡️ Admin OTP Verified';
				message = `Admin OTP verification completed for ${adminEmail}.`;
				break;
			case 'account-recovered':
				title = '🛡️ Admin Account Recovery Complete';
				message = `Admin account recovery completed for ${adminEmail}.`;
				break;
		}

		if (includeSecurityNotice) {
			message += ' Enhanced security measures are active.';
		}

		showNotification.success(title, message, NOTIFICATION_DURATION.EXTRA_LONG);
	}

	/**
	 * Handle verification success with countdown timer
	 *
	 * @param title - Notification title
	 * @param message - Base message
	 * @param countdownSeconds - Countdown duration
	 * @param email - Email address (optional)
	 * @param onComplete - Callback when countdown completes
	 */
	static handleTimedSuccess(
		title: string,
		message: string,
		countdownSeconds: number,
		email?: string,
		onComplete?: () => void,
	): void {
		const finalMessage =
			email && !message.includes(email) ? `${message} for ${email}` : message;

		showNotification.success(
			title,
			`${finalMessage} (Redirecting in ${countdownSeconds}s)`,
			countdownSeconds,
		);

		if (onComplete) {
			setTimeout(onComplete, countdownSeconds * 1000);
		}
	}

	/**
	 * Handle verification success with next steps guidance
	 *
	 * @param currentStep - Current step in the flow
	 * @param email - Email address
	 * @param customInstructions - Custom instructions (optional)
	 */
	static showNextStepInstructions(
		currentStep: 'otp-sent' | 'otp-verified' | 'password-reset' | 'login-ready',
		email: string,
		customInstructions?: string,
	): void {
		let instructions = '';

		switch (currentStep) {
			case 'otp-sent':
				instructions =
					customInstructions ||
					`Please check your email at ${email} for the 8-digit verification code. The code will expire in 10 minutes.`;
				break;
			case 'otp-verified':
				instructions =
					customInstructions ||
					`Your verification code was accepted. Processing password reset for ${email}...`;
				break;
			case 'password-reset':
				instructions =
					customInstructions ||
					`A new temporary password has been sent to ${email}. Please check your email.`;
				break;
			case 'login-ready':
				instructions =
					customInstructions ||
					`You can now log in with the new password sent to ${email}. Remember to change it after logging in.`;
				break;
		}

		showNotification.info(
			'Next Steps',
			`ℹ️ ${instructions}`,
			NOTIFICATION_DURATION.EXTRA_LONG,
		);
	}
}

// Legacy export for backward compatibility (temporary)
export const OtpSuccessHandler = OtpVerificationSuccessHandler;
