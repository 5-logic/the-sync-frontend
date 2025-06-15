'use client';

import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import {
	Button,
	Card,
	Checkbox,
	Form,
	Input,
	Layout,
	Space,
	Tabs,
	Typography,
	message,
} from 'antd';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const { Content } = Layout;
const { Title, Text } = Typography;

interface LoginValues {
	email?: string;
	username?: string;
	password: string;
}

const RememberAndForgot = () => (
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

const FormField = ({
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

const TestAccountCard = ({
	title,
	accounts,
	bgColor = 'bg-blue-50',
}: {
	title: string;
	accounts: Array<{ role: string; credential: string; color: string }>;
	bgColor?: string;
}) => (
	<div className={`mt-4 p-4 ${bgColor} rounded-lg text-sm space-y-2`}>
		<p className="font-medium text-blue-800 mb-2">{title}</p>
		<div className="grid grid-cols-1 gap-2">
			{accounts.map((account) => (
				<div
					key={`${account.role}-${account.credential}`}
					className="p-2 bg-white rounded border"
				>
					<p className={`font-medium ${account.color}`}>{account.role}</p>
					<p className={account.color.replace('text-', 'text-')}>
						{account.credential}
					</p>
				</div>
			))}
		</div>
	</div>
);

export default function SignInPage() {
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleLogin = async (values: LoginValues, isAdmin = false) => {
		setLoading(true);
		try {
			const username = values.email ?? values.username;
			const result = await signIn('credentials', {
				username,
				password: values.password,
				redirect: false,
			});

			if (result?.error) {
				message.error(`Invalid ${isAdmin ? 'username' : 'email'} or password`);
			} else {
				message.success(`${isAdmin ? 'Admin login' : 'Login'} successful!`);
				router.push('/');
			}
		} catch (error) {
			console.error(`${isAdmin ? 'Admin login' : 'Login'} error:`, error);
			message.error('Login failed. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const handleUserLogin = (values: LoginValues) => handleLogin(values, false);
	const handleAdminLogin = (values: LoginValues) => handleLogin(values, true);

	const createLoginForm = (
		onFinish: (values: LoginValues) => void,
		formName: string,
		isAdmin = false,
	) => (
		<Form
			name={formName}
			onFinish={onFinish}
			layout="vertical"
			requiredMark={false}
		>
			<FormField
				name={isAdmin ? 'username' : 'email'}
				label={isAdmin ? 'Username' : 'Email'}
				type={isAdmin ? 'text' : 'email'}
				icon={isAdmin ? <UserOutlined /> : <MailOutlined />}
				placeholder={`Enter your ${isAdmin ? 'username' : 'email'}`}
				rules={[
					{
						required: true,
						message: `Please input your ${isAdmin ? 'username' : 'email'}!`,
					},
					...(isAdmin
						? []
						: [{ type: 'email', message: 'Please enter a valid email!' }]),
				]}
			/>
			<FormField
				name="password"
				label="Password"
				type="password"
				icon={<LockOutlined />}
				placeholder="Enter your password"
				rules={[{ required: true, message: 'Please input your password!' }]}
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
			{isAdmin ? (
				<TestAccountCard
					title="🧪 Admin Test Account:"
					accounts={[
						{
							role: '👨‍💻 Administrator:',
							credential: 'Username: admin\nPassword: test123',
							color: 'text-red-700',
						},
					]}
					bgColor="bg-red-50"
				/>
			) : (
				<TestAccountCard
					title="🧪 Test Accounts (Password: test123):"
					accounts={[
						{
							role: '👨‍🎓 Student:',
							credential: 'student@fpt.edu.vn',
							color: 'text-blue-600',
						},
						{
							role: '👨‍🏫 Lecturer:',
							credential: 'lecturer@fpt.edu.vn',
							color: 'text-green-600',
						},
						{
							role: '👨‍💼 Moderator:',
							credential: 'moderator@fpt.edu.vn',
							color: 'text-purple-600',
						},
					]}
				/>
			)}
		</Form>
	);

	const tabItems = [
		{
			key: 'user',
			label: (
				<span className="flex items-center gap-2">
					<UserOutlined />
					User Login
				</span>
			),
			children: (
				<div className="pt-4">
					<p className="text-center text-gray-600 mb-6">
						Sign in to access your account
					</p>
					{createLoginForm(handleUserLogin, 'user-login', false)}
				</div>
			),
		},
		{
			key: 'admin',
			label: (
				<span className="flex items-center gap-2">
					<LockOutlined />
					Admin Login
				</span>
			),
			children: (
				<div className="pt-4">
					<p className="text-center text-gray-600 mb-6">
						Sign in to access your account
					</p>
					{createLoginForm(handleAdminLogin, 'admin-login', true)}
				</div>
			),
		},
	];

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
						<Space
							direction="vertical"
							size="small"
							align="center"
							style={{ width: '100%' }}
						>
							<Image
								src="/images/thesync-logo.svg"
								alt="TheSync Logo"
								width={150}
								height={150}
							/>
							<Title
								level={1}
								style={{
									fontSize: '30px',
									fontWeight: 800,
									color: '#111827',
									marginTop: '16px',
									marginBottom: 0,
								}}
							>
								TheSync
							</Title>
							<Text
								style={{
									fontSize: '14px',
									color: '#4b5563',
									textAlign: 'center',
									marginTop: '8px',
								}}
							>
								Group Formation and Capstone Thesis Development
							</Text>
						</Space>
						<Card style={{ boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
							<Tabs defaultActiveKey="user" centered items={tabItems} />
						</Card>
						<div style={{ textAlign: 'center', marginTop: '24px' }}>
							<Text style={{ fontSize: '12px', color: '#6b7280' }}>
								© 2025 TheSync - Five Logic. All rights reserved.
							</Text>
						</div>
					</Space>
				</div>
			</Content>
		</Layout>
	);
}
