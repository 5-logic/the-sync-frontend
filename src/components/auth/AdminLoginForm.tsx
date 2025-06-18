import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form } from 'antd';

import {
	FormField,
	LoginValues,
	RememberAndForgot,
} from '@/components/auth/LoginFormComponents';
import LoginFormLayout from '@/components/layout/LoginFormLayout';
import {
	getAdminPasswordValidationRules,
	getAdminUsernameValidationRules,
} from '@/lib/utils/auth/login-validation';

interface AdminLoginFormProps {
	readonly onFinish: (values: LoginValues) => void;
	readonly loading: boolean;
}

/**
 * 🔐 Admin Login Form Component
 * For administrators (username-based)
 */
export default function AdminLoginForm({
	onFinish,
	loading,
}: AdminLoginFormProps) {
	return (
		<LoginFormLayout title="Admin access only - sign in with username">
			<Form
				name="admin-login"
				onFinish={onFinish}
				layout="vertical"
				requiredMark={false}
				validateTrigger={['onBlur', 'onChange']}
			>
				<FormField
					name="username"
					label="Username"
					type="text"
					icon={<UserOutlined />}
					placeholder="Enter your username"
					rules={getAdminUsernameValidationRules()}
				/>
				<FormField
					name="password"
					label="Password"
					type="password"
					icon={<LockOutlined />}
					placeholder="Enter your password"
					rules={getAdminPasswordValidationRules()}
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
