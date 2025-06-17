import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Tabs } from 'antd';

import AdminLoginForm from './AdminLoginForm';
import { LoginValues } from './LoginFormComponents';
import UserLoginForm from './UserLoginForm';

interface LoginTabsProps {
	loading: boolean;
	onUserLogin: (values: LoginValues) => void;
	onAdminLogin: (values: LoginValues) => void;
}

/**
 * 📑 Login Tabs Component
 * Contains user and admin login forms in tabs
 */
export default function LoginTabs({
	loading,
	onUserLogin,
	onAdminLogin,
}: LoginTabsProps) {
	const tabItems = [
		{
			key: 'user',
			label: (
				<span className="flex items-center gap-2">
					<UserOutlined />
					Student/Lecturer
				</span>
			),
			children: <UserLoginForm onFinish={onUserLogin} loading={loading} />,
		},
		{
			key: 'admin',
			label: (
				<span className="flex items-center gap-2">
					<LockOutlined />
					Admin Login
				</span>
			),
			children: <AdminLoginForm onFinish={onAdminLogin} loading={loading} />,
		},
	];

	return <Tabs defaultActiveKey="user" centered items={tabItems} />;
}
