import { Checkbox, Form, Input } from 'antd';

/**
 * 🔗 Remember Me and Forgot Password Component
 */
export const RememberAndForgot = () => (
	<div className="flex flex-row flex-wrap items-center justify-between mb-4 gap-2 text-sm">
		<Form.Item name="remember" valuePropName="checked" noStyle>
			<Checkbox>Remember me</Checkbox>
		</Form.Item>
		<a
			href="/forgot-password"
			className="text-blue-500 hover:underline text-sm text-right"
		>
			Forgot password?
		</a>
	</div>
);

/**
 * 📝 Reusable Form Field Component
 */
export const FormField = ({
	name,
	label,
	type = 'text',
	icon,
	placeholder,
	rules,
}: {
	name: string;
	label: string;
	type?: 'text' | 'email' | 'password';
	icon: React.ReactNode;
	placeholder: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	rules: any[];
}) => (
	<Form.Item
		label={
			<span>
				{label} <span className="text-red-500">*</span>
			</span>
		}
		name={name}
		rules={rules}
	>
		{type === 'password' ? (
			<Input.Password prefix={icon} placeholder={placeholder} size="large" />
		) : (
			<Input prefix={icon} placeholder={placeholder} size="large" />
		)}
	</Form.Item>
);

/**
 * 🏷️ Login Form Values Interface
 */
export interface LoginValues {
	email?: string;
	username?: string;
	password: string;
}
