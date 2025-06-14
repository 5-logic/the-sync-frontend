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
const RememberAndForgot = () => (
	<div className="flex flex-row flex-wrap items-center justify-between mb-4 gap-2 text-sm">
		{' '}
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

export default function SignInPage() {
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleUserLogin = async (values: {
		email: string;
		password: string;
	}) => {
		setLoading(true);
		try {
			const result = await signIn('credentials', {
				username: values.email,
				password: values.password,
				redirect: false,
			});
			if (result?.error) {
				message.error('Invalid email or password');
			} else {
				message.success('Login successful!');
				router.push('/');
			}
		} catch (error) {
			console.error('Login error:', error);
			message.error('Login failed. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const handleAdminLogin = async (values: {
		username: string;
		password: string;
	}) => {
		setLoading(true);
		try {
			const result = await signIn('credentials', {
				username: values.username,
				password: values.password,
				redirect: false,
			});
			if (result?.error) {
				message.error('Invalid username or password');
			} else {
				message.success('Admin login successful!');
				router.push('/');
			}
		} catch (error) {
			console.error('Admin login error:', error);
			message.error('Login failed. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const UserLoginForm = (
		<Form
			name="user-login"
			onFinish={handleUserLogin}
			layout="vertical"
			requiredMark={false}
		>
			<Form.Item
				label={
					<span>
						Email <span className="text-red-500">*</span>
					</span>
				}
				name="email"
				rules={[
					{ required: true, message: 'Please input your email!' },
					{ type: 'email', message: 'Please enter a valid email!' },
				]}
			>
				<Input
					prefix={<MailOutlined />}
					placeholder="Enter your email"
					size="large"
				/>
			</Form.Item>

			<Form.Item
				label={
					<span>
						Password <span className="text-red-500">*</span>
					</span>
				}
				name="password"
				rules={[{ required: true, message: 'Please input your password!' }]}
			>
				<Input.Password
					prefix={<LockOutlined />}
					placeholder="Enter your password"
					size="large"
				/>
			</Form.Item>

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

			<div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm space-y-2">
				<p className="font-medium text-blue-800 mb-2">
					🧪 Test Accounts (Password: test123):
				</p>
				<div className="grid grid-cols-1 gap-2">
					<div className="p-2 bg-white rounded border">
						<p className="font-medium text-blue-700">👨‍🎓 Student:</p>
						<p className="text-blue-600">student@fpt.edu.vn</p>
					</div>
					<div className="p-2 bg-white rounded border">
						<p className="font-medium text-green-700">👨‍🏫 Lecturer:</p>
						<p className="text-green-600">lecturer@fpt.edu.vn</p>
					</div>
					<div className="p-2 bg-white rounded border">
						<p className="font-medium text-purple-700">👨‍💼 Moderator:</p>
						<p className="text-purple-600">moderator@fpt.edu.vn</p>
					</div>
				</div>
			</div>
		</Form>
	);

	const AdminLoginForm = (
		<Form
			name="admin-login"
			onFinish={handleAdminLogin}
			layout="vertical"
			requiredMark={false}
		>
			<Form.Item
				label={
					<span>
						Username <span className="text-red-500">*</span>
					</span>
				}
				name="username"
				rules={[{ required: true, message: 'Please input your username!' }]}
			>
				<Input
					prefix={<UserOutlined />}
					placeholder="Enter your username"
					size="large"
				/>
			</Form.Item>

			<Form.Item
				label={
					<span>
						Password <span className="text-red-500">*</span>
					</span>
				}
				name="password"
				rules={[{ required: true, message: 'Please input your password!' }]}
			>
				<Input.Password
					prefix={<LockOutlined />}
					placeholder="Enter your password"
					size="large"
				/>
			</Form.Item>

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

			<div className="mt-4 p-4 bg-red-50 rounded-lg text-sm">
				<p className="font-medium text-red-800 mb-1">🧪 Admin Test Account:</p>
				<div className="p-2 bg-white rounded border">
					<p className="font-medium text-red-700">👨‍💻 Administrator:</p>
					<p className="text-red-600">Username: admin</p>
					<p className="text-red-600">Password: test123</p>
				</div>
			</div>
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
					{UserLoginForm}
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
					{AdminLoginForm}
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
								src="/icons/thesync-logo.svg"
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
