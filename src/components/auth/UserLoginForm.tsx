import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Form } from 'antd';

import {
	FormField,
	LoginValues,
	RememberAndForgot,
} from '@/components/auth/LoginFormComponents';
import LoginFormLayout from '@/components/layout/LoginFormLayout';
import {
	getUserEmailValidationRules,
	getUserPasswordValidationRules,
} from '@/lib/utils/auth/login-validation';

interface UserLoginFormProps {
	readonly onFinish: (values: LoginValues) => void;
	readonly loading: boolean;
}

/**
 * 👤 User Login Form Component
 * For students and lecturers
 */
export default function UserLoginForm({
	onFinish,
	loading,
}: UserLoginFormProps) {
	return (
		<LoginFormLayout title="Sign in with your email address">
			<Form
				name="user-login"
				onFinish={onFinish}
				layout="vertical"
				requiredMark={false}
				validateTrigger={['onBlur', 'onChange']}
			>
				<FormField
					name="email"
					label="Email"
					type="email"
					icon={<MailOutlined />}
					placeholder="Enter your email"
					rules={getUserEmailValidationRules()}
				/>
				<FormField
					name="password"
					label="Password"
					type="password"
					icon={<LockOutlined />}
					placeholder="Enter your password"
					rules={getUserPasswordValidationRules()}
				/>
				<RememberAndForgot />
				<Form.Item>
					<Button
						type="primary"
						htmlType="submit"
						size="large"
						loading={loading}
						block
					>
						Sign In
					</Button>{' '}
				</Form.Item>
			</Form>
		</LoginFormLayout>
	);
}
