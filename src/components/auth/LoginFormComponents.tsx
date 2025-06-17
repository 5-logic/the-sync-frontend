import { Checkbox, Flex, Form, Input, Typography } from 'antd';

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
			<Checkbox>Remember me</Checkbox>
		</Form.Item>
		<Link href="/forgot-password" style={{ fontSize: '14px' }}>
			Forgot password?
		</Link>
	</Flex>
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
}
