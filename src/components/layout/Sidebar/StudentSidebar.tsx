'use client';

import {
	BarChartOutlined,
	BookOutlined,
	DashboardOutlined,
	FileTextOutlined,
	TeamOutlined,
	UserAddOutlined,
} from '@ant-design/icons';
import { Menu } from 'antd';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { DASHBOARD_PATHS } from '@/lib/auth/auth-constants';

const studentMenuItems = [
	{
		key: DASHBOARD_PATHS.STUDENT,
		icon: <DashboardOutlined />,
		label: <Link href={DASHBOARD_PATHS.STUDENT}>Home</Link>,
	},
	{
		key: '/student/list-thesis',
		icon: <BookOutlined />,
		label: <Link href="/student/list-thesis">List Thesis</Link>,
	},
	{
		key: '/student/join-group',
		icon: <UserAddOutlined />,
		label: <Link href="/student/join-group">Form / Join Group</Link>,
	},
	{
		key: '/student/register-thesis',
		icon: <FileTextOutlined />,
		label: <Link href="/student/register-thesis">Register Thesis</Link>,
	},
	{
		key: '/student/group-dashboard',
		icon: <TeamOutlined />,
		label: <Link href="/student/group-dashboard">Group Dashboard</Link>,
	},
	{
		key: '/student/track-progress',
		icon: <BarChartOutlined />,
		label: <Link href="/student/track-progress">Tracking Progress</Link>,
	},
];

export default function StudentSidebar() {
	const pathname = usePathname();

	return (
		<Menu
			theme="light"
			mode="inline"
			selectedKeys={[pathname]}
			items={studentMenuItems}
			style={{
				border: 'none',
				height: '100%',
			}}
		/>
	);
}
