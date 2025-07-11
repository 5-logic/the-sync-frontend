import { useRouter } from 'next/navigation';

import { showNotification } from '@/lib/utils/notification';

/**
 * ✅ Password Reset Success Handler
 * Centralized success handling for password reset flow
 */
export class PasswordResetSuccessHandler {
	/**
	 * Handle successful email submission for password reset
	 */
	static handleEmailSubmitSuccess(email: string) {
		showNotification.success(
			'Verification Email Sent',
			`📧 We've sent an 8-digit verification code to ${email}. Please check your email inbox and spam folder.`,
			5,
		);
	}

	/**
	 * Handle successful OTP resend
	 */
	static handleResendSuccess(email: string) {
		showNotification.success(
			'New Code Sent',
			`📧 A new verification code has been sent to ${email}. The previous code is no longer valid.`,
			4,
		);
	}

	/**
	 * Handle successful OTP verification and password reset
	 */
	static handlePasswordResetSuccess(
		email: string,
		router: ReturnType<typeof useRouter>,
		autoRedirect = true,
		redirectDelay = 3000,
	) {
		showNotification.success(
			'Password Reset Successful',
			`🎉 Your password has been reset successfully! A new temporary password has been sent to ${email}.`,
			6,
		);

		if (autoRedirect) {
			// Auto-redirect to login page after success
			setTimeout(() => {
				PasswordResetSuccessHandler.redirectToLogin(router, email);
			}, redirectDelay);
		}
	}

	/**
	 * Handle successful OTP verification only (without password reset)
	 */
	static handleOtpVerificationSuccess(email: string) {
		showNotification.success(
			'Code Verified Successfully',
			`✅ Verification code confirmed for ${email}. Processing your password reset...`,
			4,
		);
	}

	/**
	 * Redirect to login page with success context
	 */
	static redirectToLogin(
		router: ReturnType<typeof useRouter>,
		email?: string,
		showLoginGuidance = true,
	) {
		if (showLoginGuidance && email) {
			// Show notification about using new password
			showNotification.info(
				'Use Your New Password',
				`Please log in with the new temporary password sent to ${email}. Remember to change it after logging in.`,
				5,
			);
		}

		router.push('/login');
	}

	/**
	 * Handle successful email change in password reset flow
	 */
	static handleEmailChangeSuccess(newEmail: string, oldEmail?: string) {
		const message = oldEmail
			? `Email address changed from ${oldEmail} to ${newEmail}. A new verification code will be sent.`
			: `Email address updated to ${newEmail}. A new verification code will be sent.`;

		showNotification.success('Email Updated', `📧 ${message}`, 4);
	}

	/**
	 * Handle successful step completion with progress indication
	 */
	static handleStepCompletion(
		step: 'email' | 'verification' | 'reset' | 'complete',
		email: string,
		additionalInfo?: string,
	) {
		let message = '';
		let title = '';

		switch (step) {
			case 'email':
				title = 'Email Verified';
				message = `📧 Verification code sent to ${email}. Please check your inbox.`;
				break;
			case 'verification':
				title = 'Code Verified';
				message = `✅ Verification successful for ${email}. Generating new password...`;
				break;
			case 'reset':
				title = 'Password Reset';
				message = `🔐 New password generated for ${email}. Sending via email...`;
				break;
			case 'complete':
				title = 'Reset Complete';
				message = `🎉 Password reset completed for ${email}. ${additionalInfo || 'You can now log in with your new password.'}`;
				break;
		}

		showNotification.success(title, message, 4);
	}

	/**
	 * Handle general success with custom message and context
	 */
	static handleCustomSuccess(
		title: string,
		message: string,
		email?: string,
		duration = 4,
		emoji?: string,
	) {
		let finalMessage = message;

		if (email && !message.includes(email)) {
			finalMessage = `${message} (${email})`;
		}

		if (emoji) {
			finalMessage = `${emoji} ${finalMessage}`;
		}

		showNotification.success(title, finalMessage, duration);
	}

	/**
	 * Handle success with progress tracking for multi-step process
	 */
	static handleProgressSuccess(
		currentStep: number,
		totalSteps: number,
		stepName: string,
		description: string,
		email?: string,
	) {
		const progressText = `Step ${currentStep}/${totalSteps} completed`;
		const message = email ? `${description} for ${email}` : description;

		showNotification.success(
			`${stepName} - ${progressText}`,
			`✅ ${message}`,
			3,
		);
	}

	/**
	 * Show detailed instructions for next steps after success
	 */
	static showNextStepInstructions(
		currentStep:
			| 'email-sent'
			| 'code-verified'
			| 'password-reset'
			| 'login-ready',
		email: string,
		customInstructions?: string,
	) {
		let instructions = '';

		switch (currentStep) {
			case 'email-sent':
				instructions =
					customInstructions ||
					`Please check your email at ${email} for the 8-digit verification code. The code will expire in 10 minutes. Don't forget to check your spam folder.`;
				break;
			case 'code-verified':
				instructions =
					customInstructions ||
					`Your verification code was accepted. We're now generating a secure new password for ${email}.`;
				break;
			case 'password-reset':
				instructions =
					customInstructions ||
					`A new temporary password has been sent to ${email}. Please check your email and use it to log in.`;
				break;
			case 'login-ready':
				instructions =
					customInstructions ||
					`You can now log in with the new password sent to ${email}. For security, please change this temporary password after logging in.`;
				break;
		}

		showNotification.info('Next Steps', `ℹ️ ${instructions}`, 6);
	}

	/**
	 * Handle success with security reminder and best practices
	 */
	static handleSecuritySuccess(email: string, includeSecurityTips = true) {
		const baseMessage = `Password reset completed successfully for ${email}.`;

		let securityMessage = baseMessage;
		if (includeSecurityTips) {
			securityMessage +=
				' Remember to use a strong, unique password and enable two-factor authentication if available.';
		}

		showNotification.success('🔐 Security Update Complete', securityMessage, 7);
	}

	/**
	 * Handle success for admin/privileged users with enhanced messaging
	 */
	static handleAdminSuccess(
		adminEmail: string,
		action:
			| 'password-reset'
			| 'code-verified'
			| 'account-recovered'
			| 'email-confirmed',
		includeSecurityNotice = true,
	) {
		let title = '';
		let message = '';

		switch (action) {
			case 'password-reset':
				title = '🛡️ Admin Password Reset Complete';
				message = `Admin password reset completed for ${adminEmail}.`;
				if (includeSecurityNotice) {
					message +=
						' Enhanced security measures are active. Please review your security settings.';
				}
				break;
			case 'code-verified':
				title = '🛡️ Admin Identity Verified';
				message = `Admin identity verified for ${adminEmail}. Proceeding with secure password reset process.`;
				break;
			case 'account-recovered':
				title = '🛡️ Admin Account Recovery Complete';
				message = `Admin account recovery completed for ${adminEmail}. Please review all security settings and recent activity.`;
				break;
			case 'email-confirmed':
				title = '🛡️ Admin Email Confirmed';
				message = `Admin email confirmed for ${adminEmail}. Enhanced verification completed.`;
				break;
		}

		showNotification.success(title, message, 6);
	}

	/**
	 * Handle success with countdown timer for auto-actions
	 */
	static handleTimedSuccess(
		title: string,
		message: string,
		countdownSeconds: number,
		email?: string,
		onComplete?: () => void,
	) {
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
	 * Handle success for password strength improvement
	 */
	static handlePasswordStrengthSuccess(
		email: string,
		strengthLevel: 'weak' | 'medium' | 'strong',
	) {
		const strengthEmoji = {
			weak: '🔒',
			medium: '🔐',
			strong: '🛡️',
		};

		const strengthMessage = {
			weak: 'A new password has been generated',
			medium: 'A secure password has been generated',
			strong: 'A strong, secure password has been generated',
		};

		showNotification.success(
			`${strengthEmoji[strengthLevel]} Password Generated`,
			`${strengthMessage[strengthLevel]} for ${email}. Please check your email.`,
			5,
		);
	}

	/**
	 * Handle successful completion with user satisfaction survey prompt
	 */
	static handleCompletionWithFeedback(
		email: string,
		showFeedbackPrompt = false,
	) {
		const baseMessage = `🎉 Password reset completed successfully for ${email}!`;

		if (showFeedbackPrompt) {
			showNotification.success(
				'Reset Complete',
				`${baseMessage} We'd love your feedback on this experience.`,
				6,
			);
		} else {
			showNotification.success('Reset Complete', baseMessage, 4);
		}
	}

	/**
	 * Handle success with email verification reminder
	 */
	static handleEmailVerificationSuccess(email: string, provider?: string) {
		const providerNote = provider ? ` Check your ${provider} account.` : '';

		showNotification.success(
			'Email Verification Sent',
			`📧 Verification email sent to ${email}.${providerNote} Please click the link in the email to verify your identity.`,
			5,
		);
	}

	/**
	 * Handle bulk operation success (for admin features)
	 */
	static handleBulkOperationSuccess(
		operation: 'password-reset' | 'account-unlock' | 'email-verification',
		count: number,
		details?: string,
	) {
		const operationNames = {
			'password-reset': 'password resets',
			'account-unlock': 'account unlocks',
			'email-verification': 'email verifications',
		};

		const message = details
			? `${count} ${operationNames[operation]} completed successfully. ${details}`
			: `${count} ${operationNames[operation]} completed successfully.`;

		showNotification.success('Bulk Operation Complete', `✅ ${message}`, 4);
	}
}

// Legacy export for backward compatibility (temporary)
export const ForgotPasswordSuccessHandler = PasswordResetSuccessHandler;
