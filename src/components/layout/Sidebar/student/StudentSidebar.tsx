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

import {
	STUDENT_MENU_KEYS,
	getSelectedMenuKey,
} from '@/components/layout/Sidebar/student/StudentSidebar.config';
import { useNavigationLoader } from '@/hooks';
import { useStudentGroupStatus } from '@/hooks/useStudentGroupStatus';
import { DASHBOARD_PATHS } from '@/lib/auth/config/auth-constants';

export default function StudentSidebar() {
	const pathname = usePathname();
	const { isNavigating, targetPath, navigateWithLoading } =
		useNavigationLoader();
	const { hasGroup, loading: groupLoading } = useStudentGroupStatus();

	// Check if a specific menu item is loading
	const isMenuItemLoading = (path: string) => {
		return isNavigating && targetPath === path;
	};

	const getGroupMenuItem = () => {
		if (groupLoading) {
			return {
				key: 'group-loading',
				icon: <LoadingOutlined spin />,
				label: 'Loading...',
				onClick: () => {},
				disabled: true,
			};
		}

		if (hasGroup) {
			return {
				key: STUDENT_MENU_KEYS.GROUP_DASHBOARD,
				icon: isMenuItemLoading(STUDENT_MENU_KEYS.GROUP_DASHBOARD) ? (
					<LoadingOutlined spin />
				) : (
					<TeamOutlined />
				),
				label: 'Group Dashboard',
				onClick: () => navigateWithLoading(STUDENT_MENU_KEYS.GROUP_DASHBOARD),
				disabled:
					isNavigating && targetPath !== STUDENT_MENU_KEYS.GROUP_DASHBOARD,
			};
		}

		return {
			key: STUDENT_MENU_KEYS.JOIN_GROUP,
			icon: isMenuItemLoading(STUDENT_MENU_KEYS.JOIN_GROUP) ? (
				<LoadingOutlined spin />
			) : (
				<UserAddOutlined />
			),
			label: 'Form / Join Group',
			onClick: () => navigateWithLoading(STUDENT_MENU_KEYS.JOIN_GROUP),
			disabled: isNavigating && targetPath !== STUDENT_MENU_KEYS.JOIN_GROUP,
		};
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
			key: STUDENT_MENU_KEYS.LIST_THESIS,
			icon: isMenuItemLoading(STUDENT_MENU_KEYS.LIST_THESIS) ? (
				<LoadingOutlined spin />
			) : (
				<BookOutlined />
			),
			label: 'List Thesis',
			onClick: () => navigateWithLoading(STUDENT_MENU_KEYS.LIST_THESIS),
			disabled: isNavigating && targetPath !== STUDENT_MENU_KEYS.LIST_THESIS,
		},
		getGroupMenuItem(),
		{
			key: STUDENT_MENU_KEYS.REGISTER_THESIS,
			icon: isMenuItemLoading(STUDENT_MENU_KEYS.REGISTER_THESIS) ? (
				<LoadingOutlined spin />
			) : (
				<FileTextOutlined />
			),
			label: 'Register Thesis',
			onClick: () => navigateWithLoading(STUDENT_MENU_KEYS.REGISTER_THESIS),
			disabled:
				isNavigating && targetPath !== STUDENT_MENU_KEYS.REGISTER_THESIS,
		},
		{
			key: STUDENT_MENU_KEYS.TRACK_PROGRESS,
			icon: isMenuItemLoading(STUDENT_MENU_KEYS.TRACK_PROGRESS) ? (
				<LoadingOutlined spin />
			) : (
				<BarChartOutlined />
			),
			label: 'Tracking Progress',
			onClick: () => navigateWithLoading(STUDENT_MENU_KEYS.TRACK_PROGRESS),
			disabled: isNavigating && targetPath !== STUDENT_MENU_KEYS.TRACK_PROGRESS,
		},
	];

	return (
		<Menu
			theme="light"
			mode="inline"
			selectedKeys={[getSelectedMenuKey(pathname)]}
			items={studentMenuItems}
			style={{
				border: 'none',
				height: '100%',
			}}
		/>
	);
}
