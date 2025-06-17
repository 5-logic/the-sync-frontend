import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Form } from 'antd';
import { z } from 'zod';

import { UserLoginSchema } from '@/schemas/auth';

import {
	FormField,
	LoginValues,
	RememberAndForgot,
} from './LoginFormComponents';

interface UserLoginFormProps {
	onFinish: (values: LoginValues) => void;
	loading: boolean;
}

/**
 * 👤 User Login Form Component
 * For students and lecturers
 */
export default function UserLoginForm({
	onFinish,
	loading,
}: UserLoginFormProps) {
	// Validation rules for user login (email-based)
	const getEmailValidationRules = () => [
		{
			validator: (_: unknown, value: string) => {
				if (!value) {
					return Promise.reject(new Error('Email is required'));
				}
				try {
					const emailSchema = z.object({
						email: UserLoginSchema.shape.email,
					});
					emailSchema.parse({ email: value });
					return Promise.resolve();
				} catch (error) {
					if (error instanceof z.ZodError) {
						return Promise.reject(new Error(error.errors[0].message));
					}
					return Promise.reject(new Error('Invalid email'));
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
						password: UserLoginSchema.shape.password,
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
				Sign in with your email address
			</p>
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
					rules={getEmailValidationRules()}
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
