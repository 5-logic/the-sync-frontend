'use client';

import {
	DatabaseOutlined,
	SettingOutlined,
	TeamOutlined,
	TrophyOutlined,
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
			icon: <TrophyOutlined />,
			label: <Link href={DASHBOARD_PATHS.ADMIN}>Dashboard</Link>,
		},
		{
			key: '/admin/students-management',
			icon: <UserOutlined />,
			label: <Link href="/admin/students-management">Students Management</Link>,
		},
		{
			key: '/admin/lecture-management',
			icon: <TeamOutlined />,
			label: <Link href="/admin/lecture-management">Lecturer Management</Link>,
		},
		{
			key: '/admin/create-new-student',
			icon: <UserOutlined />,
			label: <Link href="/admin/create-new-student">Create New Student</Link>,
		},
		{
			key: '/admin/create-new-lecture',
			icon: <TeamOutlined />,
			label: <Link href="/admin/create-new-lecture">Create New Lecturer</Link>,
		},
		{
			key: '/admin/semester-settings',
			icon: <SettingOutlined />,
			label: <Link href="/admin/semester-settings">Semester Settings</Link>,
		},
		{
			key: '/admin/milestone-management',
			icon: <DatabaseOutlined />,
			label: (
				<Link href="/admin/milestone-management">Milestone Management</Link>
			),
		},
	];

	return (
		<div className="h-full bg-white border-r border-gray-200">
			<div className="p-4">
				<h2 className="text-lg font-semibold text-gray-800 mb-4">
					👨‍💻 Admin Portal
				</h2>
				<Menu
					mode="inline"
					selectedKeys={[pathname]}
					items={adminMenuItems}
					className="border-0"
				/>
			</div>
		</div>
	);
}
