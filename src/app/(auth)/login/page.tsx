'use client';

import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Tabs, message } from 'antd';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignInPage() {
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	// Handle User Login (Students & Lecturers)
	const handleUserLogin = async (values: {
		email: string;
		password: string;
	}) => {
		setLoading(true);
		try {
			console.log('🔐 User login attempt:', values.email);

			const result = await signIn('credentials', {
				username: values.email,
				password: values.password,
				redirect: false,
			});

			if (result?.error) {
				message.error('Invalid email or password');
			} else {
				message.success('Login successful!');

				// ✅ Redirect dựa trên email để phân biệt role
				if (values.email.includes('student')) {
					router.push('/student');
				} else if (
					values.email.includes('lecturer') ||
					values.email.includes('moderator')
				) {
					router.push('/lecturer');
				} else {
					router.push('/student'); // default
				}
			}
		} catch (error) {
			console.error('Login error:', error);
			message.error('Login failed. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	// Handle Admin Login
	const handleAdminLogin = async (values: {
		username: string;
		password: string;
	}) => {
		setLoading(true);
		try {
			console.log('🔐 Admin login attempt:', values.username);

			const result = await signIn('credentials', {
				username: values.username,
				password: values.password,
				redirect: false,
			});

			if (result?.error) {
				message.error('Invalid username or password');
			} else {
				message.success('Admin login successful!');
				router.push('/admin');
			}
		} catch (error) {
			console.error('Admin login error:', error);
			message.error('Login failed. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	// User Login Form (Students & Lecturers)
	const UserLoginForm = (
		<Form
			name="user-login"
			onFinish={handleUserLogin}
			layout="vertical"
			requiredMark={false}
		>
			<Form.Item
				label="Email"
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
				label="Password"
				name="password"
				rules={[{ required: true, message: 'Please input your password!' }]}
			>
				<Input.Password
					prefix={<LockOutlined />}
					placeholder="Enter your password"
					size="large"
				/>
			</Form.Item>

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

			{/* Demo credentials for testing */}
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

	// Admin Login Form
	const AdminLoginForm = (
		<Form
			name="admin-login"
			onFinish={handleAdminLogin}
			layout="vertical"
			requiredMark={false}
		>
			<Form.Item
				label="Username"
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
				label="Password"
				name="password"
				rules={[{ required: true, message: 'Please input your password!' }]}
			>
				<Input.Password
					prefix={<LockOutlined />}
					placeholder="Enter your password"
					size="large"
				/>
			</Form.Item>

			<Form.Item>
				<Button
					type="primary"
					htmlType="submit"
					size="large"
					loading={loading}
					block
				>
					Sign In as Admin
				</Button>
			</Form.Item>

			{/* Demo credentials for testing */}
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

	// Define tab items using new Ant Design format
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
						For Students & Lecturers
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
						For System Administrators
					</p>
					{AdminLoginForm}
				</div>
			),
		},
	];

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				{/* Header */}
				<div className="text-center">
					<h2 className="mt-6 text-3xl font-extrabold text-gray-900">
						Welcome to TheSync
					</h2>
					<p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
				</div>

				{/* Login Card with Tabs */}
				<Card className="shadow-lg">
					<Tabs defaultActiveKey="user" centered items={tabItems} />
				</Card>

				{/* Footer */}
				<div className="text-center">
					<p className="text-xs text-gray-500">
						© 2025 TheSync - FPT University
					</p>
				</div>
			</div>
		</div>
	);
}
