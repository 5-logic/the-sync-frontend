"use client";

import {
	BookOutlined,
	CheckSquareOutlined,
	CommentOutlined,
	CrownOutlined,
	DashboardOutlined,
	LoadingOutlined,
	ScheduleOutlined,
	TeamOutlined,
	UserAddOutlined,
	UserOutlined,
} from "@ant-design/icons";
import { Badge, Menu } from "antd";
import { usePathname } from "next/navigation";

import {
	LECTURER_MENU_KEYS,
	getSelectedMenuKey,
} from "@/components/layout/Sidebar/lecturer/LecturerSidebar.config";
import { useNavigationLoader, usePermissions } from "@/hooks";
import { DASHBOARD_PATHS } from "@/lib/auth/config/auth-constants";

// Helper function to create menu item with loading and disabled logic
const createMenuItem = (
	key: string,
	icon: React.ReactNode,
	label: string,
	navigateWithLoading: (path: string) => void,
	isNavigating: boolean,
	targetPath: string | null,
) => {
	const isLoading = isNavigating && targetPath === key;
	const isDisabled = isNavigating && targetPath !== key;

	return {
		key,
		icon: isLoading ? <LoadingOutlined spin /> : icon,
		label,
		onClick: () => navigateWithLoading(key),
		disabled: isDisabled,
	};
};

// Helper function to create basic menu items
const createBasicMenuItems = (
	navigateWithLoading: (path: string) => void,
	isNavigating: boolean,
	targetPath: string | null,
) => [
	createMenuItem(
		DASHBOARD_PATHS.LECTURER,
		<DashboardOutlined />,
		"Dashboard",
		navigateWithLoading,
		isNavigating,
		targetPath,
	),
	createMenuItem(
		LECTURER_MENU_KEYS.THESIS_MANAGEMENT,
		<BookOutlined />,
		"Thesis Management",
		navigateWithLoading,
		isNavigating,
		targetPath,
	),
	createMenuItem(
		LECTURER_MENU_KEYS.GROUP_PROGRESS,
		<TeamOutlined />,
		"Group Progress",
		navigateWithLoading,
		isNavigating,
		targetPath,
	),
	createMenuItem(
		LECTURER_MENU_KEYS.GROUP_REVIEW,
		<CommentOutlined />,
		"Group Review",
		navigateWithLoading,
		isNavigating,
		targetPath,
	),
];

// Helper function to create moderator menu items
const createModeratorMenuItems = (
	navigateWithLoading: (path: string) => void,
	isNavigating: boolean,
	targetPath: string | null,
) => [
	{
		type: "divider" as const,
		style: { margin: "8px 16px" },
	},
	{
		key: "moderator-section",
		label: (
			<span className="text-yellow-600 font-semibold flex items-center">
				<Badge color="gold" className="mr-1 hidden-when-collapsed" />
				<span className="hidden-when-collapsed ml-2">Moderator Panel</span>
				<span className="visible-when-collapsed flex justify-center items-center text-yellow-500">
					<CrownOutlined style={{ fontSize: "16px" }} />
				</span>
			</span>
		),
		type: "group" as const,
		children: [
			createMenuItem(
				DASHBOARD_PATHS.LECTURER_DASHBOARD_MODERATOR,
				<DashboardOutlined />,
				"Moderator Dashboard",
				navigateWithLoading,
				isNavigating,
				targetPath,
			),
			createMenuItem(
				DASHBOARD_PATHS.LECTURER_ASSIGN_LIST_PUBLISH_THESIS,
				<BookOutlined />,
				"Publish Thesis",
				navigateWithLoading,
				isNavigating,
				targetPath,
			),
			createMenuItem(
				DASHBOARD_PATHS.LECTURER_GROUP_MANAGEMENT,
				<UserAddOutlined />,
				"Group Management",
				navigateWithLoading,
				isNavigating,
				targetPath,
			),
			createMenuItem(
				DASHBOARD_PATHS.LECTURER_ASSIGN_SUPERVISOR,
				<UserOutlined />,
				"Assign Supervisor",
				navigateWithLoading,
				isNavigating,
				targetPath,
			),
			createMenuItem(
				DASHBOARD_PATHS.LECTURER_ASSIGN_LECTURER_REVIEW,
				<ScheduleOutlined />,
				"Assign Lecturer Review",
				navigateWithLoading,
				isNavigating,
				targetPath,
			),
			createMenuItem(
				DASHBOARD_PATHS.LECTURER_CHECKLIST_MANAGEMENT,
				<CheckSquareOutlined />,
				"Checklist Management",
				navigateWithLoading,
				isNavigating,
				targetPath,
			),
		],
	},
];

export default function LecturerSidebar() {
	const pathname = usePathname();
	const { canAccessModeratorFeatures } = usePermissions();
	const { isNavigating, targetPath, navigateWithLoading } =
		useNavigationLoader();

	const basicMenuItems = createBasicMenuItems(
		navigateWithLoading,
		isNavigating,
		targetPath,
	);

	const lecturerMenuItems = canAccessModeratorFeatures
		? [
				...basicMenuItems,
				...createModeratorMenuItems(
					navigateWithLoading,
					isNavigating,
					targetPath,
				),
			]
		: basicMenuItems;

	return (
		<Menu
			theme="light"
			mode="inline"
			selectedKeys={[getSelectedMenuKey(pathname)]}
			items={lecturerMenuItems}
			style={{
				border: "none",
				height: "100%",
			}}
		/>
	);
}
