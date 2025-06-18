'use client';

import {
	CalendarOutlined,
	DashboardOutlined,
	LoadingOutlined,
	SettingOutlined,
	TeamOutlined,
	UserOutlined,
} from '@ant-design/icons';
import { Menu } from 'antd';
import { usePathname } from 'next/navigation';

import { useNavigationLoader } from '@/hooks';
import { DASHBOARD_PATHS } from '@/lib/auth/config/auth-constants';

export default function AdminSidebar() {
	const pathname = usePathname();
	const { isNavigating, targetPath, navigateWithLoading } =
		useNavigationLoader();

	// Check if a specific menu item is loading
	const isMenuItemLoading = (path: string) => {
		return isNavigating && targetPath === path;
	};

	const adminMenuItems = [
		{
			key: DASHBOARD_PATHS.ADMIN,
			icon: isMenuItemLoading(DASHBOARD_PATHS.ADMIN) ? (
				<LoadingOutlined spin />
			) : (
				<DashboardOutlined />
			),
			label: 'Dashboard',
			onClick: () => navigateWithLoading(DASHBOARD_PATHS.ADMIN),
			disabled: isNavigating && targetPath !== DASHBOARD_PATHS.ADMIN,
		},
		{
			key: '/admin/students-management',
			icon: isMenuItemLoading('/admin/students-management') ? (
				<LoadingOutlined spin />
			) : (
				<UserOutlined />
			),
			label: 'Student Management',
			onClick: () => navigateWithLoading('/admin/students-management'),
			disabled: isNavigating && targetPath !== '/admin/students-management',
		},
		{
			key: '/admin/lecturer-management',
			icon: isMenuItemLoading('/admin/lecturer-management') ? (
				<LoadingOutlined spin />
			) : (
				<TeamOutlined />
			),
			label: 'Lecturer Management',
			onClick: () => navigateWithLoading('/admin/lecturer-management'),
			disabled: isNavigating && targetPath !== '/admin/lecturer-management',
		},
		{
			key: '/admin/milestone-management',
			icon: isMenuItemLoading('/admin/milestone-management') ? (
				<LoadingOutlined spin />
			) : (
				<CalendarOutlined />
			),
			label: 'Milestone Management',
			onClick: () => navigateWithLoading('/admin/milestone-management'),
			disabled: isNavigating && targetPath !== '/admin/milestone-management',
		},
		{
			key: '/admin/semester-settings',
			icon: isMenuItemLoading('/admin/semester-settings') ? (
				<LoadingOutlined spin />
			) : (
				<SettingOutlined />
			),
			label: 'Semester Setting',
			onClick: () => navigateWithLoading('/admin/semester-settings'),
			disabled: isNavigating && targetPath !== '/admin/semester-settings',
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
