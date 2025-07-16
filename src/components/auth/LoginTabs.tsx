import { AuditOutlined, UserOutlined } from '@ant-design/icons';
import { Flex, Tabs, Typography } from 'antd';

import AdminLoginForm from '@/components/auth/AdminLoginForm';
import { LoginValues } from '@/components/auth/LoginFormComponents';
import UserLoginForm from '@/components/auth/UserLoginForm';

const { Text } = Typography;

interface LoginTabsProps {
	readonly loading: boolean;
	readonly onUserLogin: (values: LoginValues) => void;
	readonly onAdminLogin: (values: LoginValues) => void;
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
				<Flex align="center" gap="small">
					<UserOutlined />
					<Text>Student/Lecturer</Text>
				</Flex>
			),
			children: <UserLoginForm onFinish={onUserLogin} loading={loading} />,
		},
		{
			key: 'admin',
			label: (
				<Flex align="center" gap="small">
					<AuditOutlined />
					<Text>Administrator</Text>
				</Flex>
			),
			children: <AdminLoginForm onFinish={onAdminLogin} loading={loading} />,
		},
	];

	return <Tabs defaultActiveKey="user" centered items={tabItems} />;
}
