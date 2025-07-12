import { CheckCircleOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Result } from 'antd';
import { useRouter } from 'next/navigation';

import { PasswordResetSuccessHandler } from '@/components/auth/PasswordResetSuccessHandler';
import LoginFormLayout from '@/components/layout/LoginFormLayout';

/**
 * Props for PasswordResetSuccess component
 */
interface PasswordResetSuccessProps {
	/** Email address where the new password was sent */
	readonly email: string;
}

/**
 * ✅ Password Reset Success Page Component
 * Styled consistently with login forms
 *
 * @description Success screen shown after password reset completion
 * @version 1.0.0
 */
export const PasswordResetSuccessPage = ({
	email,
}: PasswordResetSuccessProps) => {
	const router = useRouter();

	const handleBackToLogin = () => {
		// Use PasswordResetSuccessHandler for centralized navigation with context
		PasswordResetSuccessHandler.redirectToLogin(router, email, true);
	};

	const handleCheckEmail = () => {
		// Open default email client
		window.location.href = 'https://mail.google.com/mail';
	};
	return (
		<LoginFormLayout title="Password Reset Successful!">
			<Result
				icon={<CheckCircleOutlined style={{ color: '#10b981' }} />}
				title={null}
				subTitle={
					<div style={{ color: '#6b7280', marginBottom: '24px' }}>
						A new password has been sent to <strong>{email}</strong>.
						<br />
						Please check your email and use the new password to log in.
					</div>
				}
				extra={[
					<Button
						key="email"
						icon={<MailOutlined />}
						onClick={handleCheckEmail}
						size="large"
						style={{ marginRight: '8px' }}
					>
						Check Email
					</Button>,
					<Button
						key="login"
						type="primary"
						onClick={handleBackToLogin}
						size="large"
					>
						Back to Login
					</Button>,
				]}
			/>
		</LoginFormLayout>
	);
};

// Legacy exports for backward compatibility (temporary)
export const PasswordResetSuccess = PasswordResetSuccessPage;
export const SuccessResult = PasswordResetSuccessPage;
