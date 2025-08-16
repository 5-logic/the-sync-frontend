"use client";

import {
	CalendarOutlined,
	DashboardOutlined,
	FundProjectionScreenOutlined,
	LoadingOutlined,
	SettingOutlined,
	TeamOutlined,
	UserOutlined,
	UsergroupAddOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { usePathname } from "next/navigation";

import {
	ADMIN_MENU_KEYS,
	getSelectedMenuKey,
} from "@/components/layout/Sidebar/admin/AdminSidebar.config";
import { useNavigationLoader } from "@/hooks";
import { DASHBOARD_PATHS } from "@/lib/auth/config/auth-constants";

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
			label: "Dashboard",
			onClick: () => navigateWithLoading(DASHBOARD_PATHS.ADMIN),
			disabled: isNavigating && targetPath !== DASHBOARD_PATHS.ADMIN,
		},
		{
			key: ADMIN_MENU_KEYS.STUDENTS_MANAGEMENT,
			icon: isMenuItemLoading(ADMIN_MENU_KEYS.STUDENTS_MANAGEMENT) ? (
				<LoadingOutlined spin />
			) : (
				<UserOutlined />
			),
			label: "Student Management",
			onClick: () => navigateWithLoading(ADMIN_MENU_KEYS.STUDENTS_MANAGEMENT),
			disabled:
				isNavigating && targetPath !== ADMIN_MENU_KEYS.STUDENTS_MANAGEMENT,
		},
		{
			key: ADMIN_MENU_KEYS.GROUP_MANAGEMENT,
			icon: isMenuItemLoading(ADMIN_MENU_KEYS.GROUP_MANAGEMENT) ? (
				<LoadingOutlined spin />
			) : (
				<UsergroupAddOutlined />
			),
			label: "Group Management",
			onClick: () => navigateWithLoading(ADMIN_MENU_KEYS.GROUP_MANAGEMENT),
			disabled: isNavigating && targetPath !== ADMIN_MENU_KEYS.GROUP_MANAGEMENT,
		},
		{
			key: ADMIN_MENU_KEYS.LECTURER_MANAGEMENT,
			icon: isMenuItemLoading(ADMIN_MENU_KEYS.LECTURER_MANAGEMENT) ? (
				<LoadingOutlined spin />
			) : (
				<TeamOutlined />
			),
			label: "Lecturer Management",
			onClick: () => navigateWithLoading(ADMIN_MENU_KEYS.LECTURER_MANAGEMENT),
			disabled:
				isNavigating && targetPath !== ADMIN_MENU_KEYS.LECTURER_MANAGEMENT,
		},
		{
			key: ADMIN_MENU_KEYS.MILESTONE_MANAGEMENT,
			icon: isMenuItemLoading(ADMIN_MENU_KEYS.MILESTONE_MANAGEMENT) ? (
				<LoadingOutlined spin />
			) : (
				<CalendarOutlined />
			),
			label: "Milestone Management",
			onClick: () => navigateWithLoading(ADMIN_MENU_KEYS.MILESTONE_MANAGEMENT),
			disabled:
				isNavigating && targetPath !== ADMIN_MENU_KEYS.MILESTONE_MANAGEMENT,
		},
		{
			key: ADMIN_MENU_KEYS.CAPSTONE_DEFENSE,
			icon: isMenuItemLoading(ADMIN_MENU_KEYS.CAPSTONE_DEFENSE) ? (
				<LoadingOutlined spin />
			) : (
				<FundProjectionScreenOutlined />
			),
			label: "Defense Results",
			onClick: () => navigateWithLoading(ADMIN_MENU_KEYS.CAPSTONE_DEFENSE),
			disabled: isNavigating && targetPath !== ADMIN_MENU_KEYS.CAPSTONE_DEFENSE,
		},
		{
			key: ADMIN_MENU_KEYS.SEMESTER_SETTINGS,
			icon: isMenuItemLoading(ADMIN_MENU_KEYS.SEMESTER_SETTINGS) ? (
				<LoadingOutlined spin />
			) : (
				<SettingOutlined />
			),
			label: "Semester Settings",
			onClick: () => navigateWithLoading(ADMIN_MENU_KEYS.SEMESTER_SETTINGS),
			disabled:
				isNavigating && targetPath !== ADMIN_MENU_KEYS.SEMESTER_SETTINGS,
		},
	];
	return (
		<Menu
			theme="light"
			mode="inline"
			selectedKeys={[getSelectedMenuKey(pathname)]}
			items={adminMenuItems}
			style={{
				border: "none",
				height: "100%",
			}}
		/>
	);
}
