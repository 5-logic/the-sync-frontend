'use client';

import {
	BookOutlined,
	ClockCircleOutlined,
	CrownOutlined,
	DashboardOutlined,
	LoadingOutlined,
	ScheduleOutlined,
	TeamOutlined,
	UserAddOutlined,
	UserOutlined,
} from '@ant-design/icons';
import { Badge, Menu } from 'antd';
import { usePathname } from 'next/navigation';

import {
	LECTURER_MENU_KEYS,
	getSelectedMenuKey,
} from '@/components/layout/Sidebar/lecturer/LecturerSidebar.config';
import { useNavigationLoader, usePermissions } from '@/hooks';
import { DASHBOARD_PATHS } from '@/lib/auth/config/auth-constants';

export default function LecturerSidebar() {
	const pathname = usePathname();
	const { canAccessModeratorFeatures } = usePermissions();
	const { isNavigating, targetPath, navigateWithLoading } =
		useNavigationLoader();

	// Check if a specific menu item is loading
	const isMenuItemLoading = (path: string) => {
		return isNavigating && targetPath === path;
	};

	const basicMenuItems = [
		{
			key: DASHBOARD_PATHS.LECTURER,
			icon: isMenuItemLoading(DASHBOARD_PATHS.LECTURER) ? (
				<LoadingOutlined spin />
			) : (
				<DashboardOutlined />
			),
			label: 'Dashboard',
			onClick: () => navigateWithLoading(DASHBOARD_PATHS.LECTURER),
			disabled: isNavigating && targetPath !== DASHBOARD_PATHS.LECTURER,
		},
		{
			key: LECTURER_MENU_KEYS.THESIS_MANAGEMENT,
			icon: isMenuItemLoading(LECTURER_MENU_KEYS.THESIS_MANAGEMENT) ? (
				<LoadingOutlined spin />
			) : (
				<BookOutlined />
			),
			label: 'Thesis Management',
			onClick: () => navigateWithLoading(LECTURER_MENU_KEYS.THESIS_MANAGEMENT),
			disabled:
				isNavigating && targetPath !== LECTURER_MENU_KEYS.THESIS_MANAGEMENT,
		},
		{
			key: LECTURER_MENU_KEYS.GROUP_PROGRESS,
			icon: isMenuItemLoading(LECTURER_MENU_KEYS.GROUP_PROGRESS) ? (
				<LoadingOutlined spin />
			) : (
				<TeamOutlined />
			),
			label: 'Group Progress',
			onClick: () => navigateWithLoading(LECTURER_MENU_KEYS.GROUP_PROGRESS),
			disabled:
				isNavigating && targetPath !== LECTURER_MENU_KEYS.GROUP_PROGRESS,
		},
		{
			key: LECTURER_MENU_KEYS.TIMELINE_REVIEW,
			icon: isMenuItemLoading(LECTURER_MENU_KEYS.TIMELINE_REVIEW) ? (
				<LoadingOutlined spin />
			) : (
				<ClockCircleOutlined />
			),
			label: 'Timeline Review',
			onClick: () => navigateWithLoading(LECTURER_MENU_KEYS.TIMELINE_REVIEW),
			disabled:
				isNavigating && targetPath !== LECTURER_MENU_KEYS.TIMELINE_REVIEW,
		},
	];
	const moderatorMenuItems = [
		{
			type: 'divider' as const,
			style: { margin: '8px 16px' },
		},
		{
			key: 'moderator-section',
			label: (
				<span className="text-yellow-600 font-semibold flex items-center">
					<Badge color="gold" className="mr-1 hidden-when-collapsed" />
					<span className="hidden-when-collapsed ml-2">Moderator Panel</span>
					<span className="visible-when-collapsed flex justify-center items-center text-yellow-500">
						<CrownOutlined style={{ fontSize: '16px' }} />
					</span>
				</span>
			),
			type: 'group' as const,
			children: [
				{
					key: DASHBOARD_PATHS.LECTURER_ASSIGN_STUDENT_LIST,
					icon: isMenuItemLoading(
						DASHBOARD_PATHS.LECTURER_ASSIGN_STUDENT_LIST,
					) ? (
						<LoadingOutlined spin />
					) : (
						<UserAddOutlined />
					),
					label: 'Assign Student',
					onClick: () =>
						navigateWithLoading(DASHBOARD_PATHS.LECTURER_ASSIGN_STUDENT_LIST),
					disabled:
						isNavigating &&
						targetPath !== DASHBOARD_PATHS.LECTURER_ASSIGN_STUDENT_LIST,
				},
				{
					key: DASHBOARD_PATHS.LECTURER_ASSIGN_SUPERVISOR,
					icon: isMenuItemLoading(
						DASHBOARD_PATHS.LECTURER_ASSIGN_SUPERVISOR,
					) ? (
						<LoadingOutlined spin />
					) : (
						<UserOutlined />
					),
					label: 'Assign Supervisor',
					onClick: () =>
						navigateWithLoading(DASHBOARD_PATHS.LECTURER_ASSIGN_SUPERVISOR),
					disabled:
						isNavigating &&
						targetPath !== DASHBOARD_PATHS.LECTURER_ASSIGN_SUPERVISOR,
				},
				{
					key: '/lecturer/assign-lecturer-review',
					icon: isMenuItemLoading('/lecturer/assign-lecturer-review') ? (
						<LoadingOutlined spin />
					) : (
						<ScheduleOutlined />
					),
					label: 'Assign Lecturer Review',
					onClick: () =>
						navigateWithLoading('/lecturer/assign-lecturer-review'),
					disabled:
						isNavigating && targetPath !== '/lecturer/assign-lecturer-review',
				},
			],
		},
	];

	const lecturerMenuItems = canAccessModeratorFeatures
		? [...basicMenuItems, ...moderatorMenuItems]
		: basicMenuItems;
	return (
		<Menu
			theme="light"
			mode="inline"
			selectedKeys={[getSelectedMenuKey(pathname)]}
			items={lecturerMenuItems}
			style={{
				border: 'none',
				height: '100%',
			}}
		/>
	);
}
