'use client';

import {
	BarChartOutlined,
	BookOutlined,
	DashboardOutlined,
	FileTextOutlined,
	LoadingOutlined,
	TeamOutlined,
	UserAddOutlined,
} from '@ant-design/icons';
import { Menu } from 'antd';
import { usePathname } from 'next/navigation';

import { useNavigationLoader } from '@/hooks';
import { DASHBOARD_PATHS } from '@/lib/auth/config/auth-constants';

export default function StudentSidebar() {
	const pathname = usePathname();
	const { isNavigating, targetPath, navigateWithLoading } =
		useNavigationLoader();

	// Check if a specific menu item is loading
	const isMenuItemLoading = (path: string) => {
		return isNavigating && targetPath === path;
	};

	const studentMenuItems = [
		{
			key: DASHBOARD_PATHS.STUDENT,
			icon: isMenuItemLoading(DASHBOARD_PATHS.STUDENT) ? (
				<LoadingOutlined spin />
			) : (
				<DashboardOutlined />
			),
			label: 'Home',
			onClick: () => navigateWithLoading(DASHBOARD_PATHS.STUDENT),
			disabled: isNavigating && targetPath !== DASHBOARD_PATHS.STUDENT,
		},
		{
			key: '/student/list-thesis',
			icon: isMenuItemLoading('/student/list-thesis') ? (
				<LoadingOutlined spin />
			) : (
				<BookOutlined />
			),
			label: 'List Thesis',
			onClick: () => navigateWithLoading('/student/list-thesis'),
			disabled: isNavigating && targetPath !== '/student/list-thesis',
		},
		{
			key: '/student/join-group',
			icon: isMenuItemLoading('/student/join-group') ? (
				<LoadingOutlined spin />
			) : (
				<UserAddOutlined />
			),
			label: 'Form / Join Group',
			onClick: () => navigateWithLoading('/student/join-group'),
			disabled: isNavigating && targetPath !== '/student/join-group',
		},
		{
			key: '/student/register-thesis',
			icon: isMenuItemLoading('/student/register-thesis') ? (
				<LoadingOutlined spin />
			) : (
				<FileTextOutlined />
			),
			label: 'Register Thesis',
			onClick: () => navigateWithLoading('/student/register-thesis'),
			disabled: isNavigating && targetPath !== '/student/register-thesis',
		},
		{
			key: '/student/group-dashboard',
			icon: isMenuItemLoading('/student/group-dashboard') ? (
				<LoadingOutlined spin />
			) : (
				<TeamOutlined />
			),
			label: 'Group Dashboard',
			onClick: () => navigateWithLoading('/student/group-dashboard'),
			disabled: isNavigating && targetPath !== '/student/group-dashboard',
		},
		{
			key: '/student/track-progress',
			icon: isMenuItemLoading('/student/track-progress') ? (
				<LoadingOutlined spin />
			) : (
				<BarChartOutlined />
			),
			label: 'Tracking Progress',
			onClick: () => navigateWithLoading('/student/track-progress'),
			disabled: isNavigating && targetPath !== '/student/track-progress',
		},
	];

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
