'use client';

import { Card, Layout, Space } from 'antd';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import LoginFooter from '@/components/auth/LoginFooter';
import LoginHeader from '@/components/auth/LoginHeader';
import { PasswordResetEmailForm } from '@/components/auth/PasswordResetEmailForm';
import { PasswordResetErrorHandler } from '@/components/auth/PasswordResetErrorHandler';
import { PasswordResetOtpForm } from '@/components/auth/PasswordResetOtpForm';
import { PasswordResetSuccess } from '@/components/auth/PasswordResetSuccess';
import { PasswordResetSuccessHandler } from '@/components/auth/PasswordResetSuccessHandler';
import PasswordService from '@/lib/services/auth/password.service';
import { ForgotPasswordRequest } from '@/schemas/forgot-password';

const { Content } = Layout;

type Step = 'email' | 'otp' | 'success';

/**
 * Forgot Password Page
 * Handles email submission, OTP verification, and success display
 */
export default function ForgotPasswordPage() {
	const [currentStep, setCurrentStep] = useState<Step>('email');
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);
	const [resendLoading, setResendLoading] = useState(false);
	const [otpResetTrigger, setOtpResetTrigger] = useState(0);
	const router = useRouter();

	/**
	 * Handle email submission for OTP request
	 */
	const handleEmailSubmit = async (values: ForgotPasswordRequest) => {
		setLoading(true);
		try {
			const response = await PasswordService.requestPasswordReset(values.email);
			if (response.success) {
				setEmail(values.email);
				setCurrentStep('otp');
				// Use PasswordResetSuccessHandler for centralized success handling
				PasswordResetSuccessHandler.handleEmailSubmitSuccess(values.email);
			} else {
				// Use PasswordResetErrorHandler for centralized error handling
				PasswordResetErrorHandler.handleEmailError(
					response.error || 'Please check your email address and try again.',
					response.statusCode,
				);
			}
		} catch (error) {
			console.error('Error requesting password reset:', error);
			// Use PasswordResetErrorHandler for unexpected errors
			PasswordResetErrorHandler.handleUnexpectedError(error, 'Email request');
		} finally {
			setLoading(false);
		}
	};

	/**
	 * Handle OTP verification
	 */
	const handleOtpSubmit = async (values: { otpCode: string }) => {
		setLoading(true);
		try {
			const response = await PasswordService.verifyOtpAndResetPassword(
				email,
				values.otpCode,
			);

			if (response.success) {
				setCurrentStep('success');
				// Use PasswordResetSuccessHandler for centralized success handling
				PasswordResetSuccessHandler.handlePasswordResetSuccess(
					email,
					router,
					false,
				);
			} else {
				// Trigger OTP form reset on error
				setOtpResetTrigger((prev) => prev + 1);

				// Use PasswordResetErrorHandler for centralized error handling
				PasswordResetErrorHandler.handleOtpError(
					response.error || 'An error occurred',
					response.statusCode,
				);
			}
		} catch (error) {
			// Log detailed error information for debugging
			console.error('Error verifying OTP - Full error:', error);
			console.error('Error type:', typeof error);
			console.error(
				'Error message:',
				error instanceof Error ? error.message : 'Unknown error',
			);

			// Trigger OTP form reset on network error
			setOtpResetTrigger((prev) => prev + 1);

			// Use PasswordResetErrorHandler for centralized unexpected error handling
			PasswordResetErrorHandler.handleUnexpectedError(
				error,
				'OTP verification',
			);
		} finally {
			setLoading(false);
		}
	};

	/**
	 * Handle resend OTP
	 */
	const handleResendOtp = async () => {
		setResendLoading(true);
		try {
			const response = await PasswordService.requestPasswordReset(email);
			if (response.success) {
				// Use PasswordResetSuccessHandler for centralized success handling
				PasswordResetSuccessHandler.handleResendSuccess(email);
			} else {
				// Use PasswordResetErrorHandler for centralized resend error handling
				PasswordResetErrorHandler.handleEmailError(
					response.error ||
						'Unable to resend verification code. Please try again.',
					response.statusCode,
				);
			}
		} catch (error) {
			console.error('Error resending OTP:', error);
			// Use PasswordResetErrorHandler for unexpected resend errors
			PasswordResetErrorHandler.handleUnexpectedError(error, 'Resend OTP');
		} finally {
			setResendLoading(false);
		}
	};

	/**
	 * Handle back to email step
	 */
	const handleBackToEmail = () => {
		setCurrentStep('email');
		setEmail('');
	};

	/**
	 * Render step content with consistent layout
	 */
	const renderStepContent = () => {
		switch (currentStep) {
			case 'email':
				return (
					<PasswordResetEmailForm
						onSubmit={handleEmailSubmit}
						loading={loading}
					/>
				);

			case 'otp':
				return (
					<PasswordResetOtpForm
						onSubmit={handleOtpSubmit}
						onResendOtp={handleResendOtp}
						onBackToEmail={handleBackToEmail}
						loading={loading}
						resendLoading={resendLoading}
						resetTrigger={otpResetTrigger}
					/>
				);

			case 'success':
				return <PasswordResetSuccess email={email} />;

			default:
				return null;
		}
	};

	return (
		<Layout style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
			<Content
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					padding: '48px 16px',
				}}
			>
				<div style={{ width: '100%', maxWidth: '448px' }}>
					<Space direction="vertical" size="large" style={{ width: '100%' }}>
						<LoginHeader />
						<Card style={{ boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
							{renderStepContent()}
						</Card>
						{currentStep !== 'success' && <LoginFooter />}
					</Space>
				</div>
			</Content>
		</Layout>
	);
}
