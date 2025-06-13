'use client';

import {
	CalendarOutlined,
	DashboardOutlined,
	SettingOutlined,
	TeamOutlined,
	UserOutlined,
} from '@ant-design/icons';
import { Menu } from 'antd';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { DASHBOARD_PATHS } from '@/lib/auth/auth-constants';

export default function AdminSidebar() {
	const pathname = usePathname();

	const adminMenuItems = [
		{
			key: DASHBOARD_PATHS.ADMIN,
			icon: <DashboardOutlined />,
			label: <Link href={DASHBOARD_PATHS.ADMIN}>Dashboard</Link>,
		},
		{
			key: '/admin/students-management',
			icon: <UserOutlined />,
			label: <Link href="/admin/students-management">Student Management</Link>,
		},
		{
			key: '/admin/lecture-management',
			icon: <TeamOutlined />,
			label: <Link href="/admin/lecture-management">Lecturer Management</Link>,
		},
		{
			key: '/admin/milestone-management',
			icon: <CalendarOutlined />,
			label: (
				<Link href="/admin/milestone-management">Milestone Management</Link>
			),
		},
		{
			key: '/admin/semester-settings',
			icon: <SettingOutlined />,
			label: <Link href="/admin/semester-settings">Semester Management</Link>,
		},
	];
	return (
		<Menu
			theme="light"
			mode="inline"
			selectedKeys={[pathname]}
			items={adminMenuItems}
			style={{
				border: 'none',
				height: '100%',
			}}
		/>
	);
}
