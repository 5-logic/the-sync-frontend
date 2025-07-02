import { Checkbox, Flex, Form, Input, Typography } from 'antd';
import type { Rule } from 'antd/es/form';

const { Link, Text } = Typography;

/**
 * 🔗 Remember Me and Forgot Password Component
 */
export const RememberAndForgot = () => (
	<Flex
		justify="space-between"
		align="center"
		wrap="wrap"
		gap="small"
		style={{ marginBottom: '1rem' }}
	>
		<Form.Item name="remember" valuePropName="checked" noStyle>
			<Checkbox>
				<Text style={{ fontSize: '14px' }}>Remember me</Text>
			</Checkbox>
		</Form.Item>
		<Link href="/forgot-password" style={{ fontSize: '14px' }}>
			Forgot password?
		</Link>
	</Flex>
);

interface FormFieldProps {
	readonly name: string;
	readonly label: string;
	readonly type?: 'text' | 'email' | 'password';
	readonly icon: React.ReactNode;
	readonly placeholder: string;
	readonly rules: Rule[];
}

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
}: FormFieldProps) => (
	<Form.Item
		label={
			<Text>
				{label} <Text style={{ color: '#ef4444' }}>*</Text>
			</Text>
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
	remember?: boolean;
}
