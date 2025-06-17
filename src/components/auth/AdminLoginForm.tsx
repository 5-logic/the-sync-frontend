import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form } from 'antd';
import { z } from 'zod';

import { AdminLoginSchema } from '@/schemas/auth';

import {
	FormField,
	LoginValues,
	RememberAndForgot,
} from './LoginFormComponents';

interface AdminLoginFormProps {
	onFinish: (values: LoginValues) => void;
	loading: boolean;
}

/**
 * 🔐 Admin Login Form Component
 * For administrators (username-based)
 */
export default function AdminLoginForm({
	onFinish,
	loading,
}: AdminLoginFormProps) {
	// Validation rules for admin login (username-based)
	const getUsernameValidationRules = () => [
		{
			validator: (_: unknown, value: string) => {
				if (!value) {
					return Promise.reject(new Error('Username is required'));
				}
				try {
					const usernameSchema = z.object({
						username: AdminLoginSchema.shape.username,
					});
					usernameSchema.parse({ username: value });
					return Promise.resolve();
				} catch (error) {
					if (error instanceof z.ZodError) {
						return Promise.reject(new Error(error.errors[0].message));
					}
					return Promise.reject(new Error('Invalid username'));
				}
			},
		},
	];

	const getPasswordValidationRules = () => [
		{
			validator: (_: unknown, value: string) => {
				if (!value) {
					return Promise.reject(new Error('Password is required'));
				}
				try {
					const passwordSchema = z.object({
						password: AdminLoginSchema.shape.password,
					});
					passwordSchema.parse({ password: value });
					return Promise.resolve();
				} catch (error) {
					if (error instanceof z.ZodError) {
						return Promise.reject(new Error(error.errors[0].message));
					}
					return Promise.reject(new Error('Invalid password'));
				}
			},
		},
	];

	return (
		<div className="pt-4">
			<p className="text-center text-gray-600 mb-6">
				Admin access only - sign in with username
			</p>
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
					rules={getUsernameValidationRules()}
				/>
				<FormField
					name="password"
					label="Password"
					type="password"
					icon={<LockOutlined />}
					placeholder="Enter your password"
					rules={getPasswordValidationRules()}
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
					</Button>
				</Form.Item>
			</Form>
		</div>
	);
}
