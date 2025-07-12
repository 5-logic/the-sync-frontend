import { ArrowLeftOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Form } from 'antd';
import { useRouter } from 'next/navigation';

import { FormField } from '@/components/auth/LoginFormComponents';
import LoginFormLayout from '@/components/layout/LoginFormLayout';
import { getUserEmailValidationRules } from '@/lib/utils/auth/login-validation';
import { ForgotPasswordRequest } from '@/schemas/forgot-password';

/**
 * Props for PasswordResetEmailForm component
 */
interface PasswordResetEmailFormProps {
	/** Callback function when form is submitted */
	readonly onSubmit: (values: ForgotPasswordRequest) => void;
	/** Loading state for the submit button */
	readonly loading: boolean;
}

/**
 * 📧 Password Reset Email Form Component
 * Styled consistently with login forms
 *
 * @description Form component for collecting email address during password reset flow
 * @version 1.0.0
 */
export const PasswordResetEmailForm = ({
	onSubmit,
	loading,
}: PasswordResetEmailFormProps) => {
	const router = useRouter();
	const [form] = Form.useForm<ForgotPasswordRequest>();

	return (
		<LoginFormLayout title="Reset your password">
			<Form
				form={form}
				name="password-reset-email"
				onFinish={onSubmit}
				layout="vertical"
				size="large"
				requiredMark={false}
				validateTrigger={['onBlur', 'onChange']}
				autoComplete="off"
			>
				<FormField
					name="email"
					label="Email Address"
					type="email"
					icon={<MailOutlined />}
					placeholder="Enter your email address"
					rules={getUserEmailValidationRules()}
				/>

				<Form.Item>
					<Button
						type="primary"
						htmlType="submit"
						loading={loading}
						block
						size="large"
						style={{
							marginTop: '8px',
						}}
					>
						{loading ? 'Sending...' : 'Send Verification Code'}
					</Button>
				</Form.Item>

				<div style={{ textAlign: 'center', marginTop: '16px' }}>
					<Button
						type="link"
						icon={<ArrowLeftOutlined />}
						onClick={() => router.push('/login')}
						style={{ fontSize: '14px' }}
					>
						Back to Login
					</Button>
				</div>
			</Form>
		</LoginFormLayout>
	);
};

// Legacy export for backward compatibility (temporary)
export const EmailForm = PasswordResetEmailForm;
