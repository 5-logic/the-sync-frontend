'use client';

import {
	BookOutlined,
	SettingOutlined,
	TeamOutlined,
	TrophyOutlined,
	UserAddOutlined,
	UserOutlined,
} from '@ant-design/icons';
import { Badge, Menu } from 'antd';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { usePermissions } from '@/hooks/usePermissions';
import { DASHBOARD_PATHS } from '@/lib/auth/auth-constants';

export default function LecturerSidebar() {
	const pathname = usePathname();
	const { canAccessModeratorFeatures } = usePermissions();

	const basicMenuItems = [
		{
			key: DASHBOARD_PATHS.LECTURER,
			icon: <TrophyOutlined />,
			label: <Link href={DASHBOARD_PATHS.LECTURER}>Dashboard</Link>,
		},
		{
			key: '/lecturer/thesis-management',
			icon: <BookOutlined />,
			label: <Link href="/lecturer/thesis-management">Thesis Management</Link>,
		},
		{
			key: '/lecturer/group-progress',
			icon: <TeamOutlined />,
			label: <Link href="/lecturer/group-progress">Group Progress</Link>,
		},
		{
			key: '/lecturer/profile-settings',
			icon: <SettingOutlined />,
			label: <Link href="/lecturer/profile-settings">Profile Settings</Link>,
		},
	];

	const moderatorMenuItems = [
		{
			type: 'divider' as const,
		},
		{
			key: 'moderator-section',
			label: (
				<span className="text-yellow-600 font-semibold">
					<Badge color="gold" /> Moderator Panel
				</span>
			),
			type: 'group' as const,
			children: [
				{
					key: DASHBOARD_PATHS.LECTURER_ASSIGN_STUDENT_LIST,
					icon: <UserAddOutlined />,
					label: (
						<Link href={DASHBOARD_PATHS.LECTURER_ASSIGN_STUDENT_LIST}>
							Assign Students
						</Link>
					),
				},
				{
					key: DASHBOARD_PATHS.LECTURER_ASSIGN_SUPERVISOR,
					icon: <UserOutlined />,
					label: (
						<Link href={DASHBOARD_PATHS.LECTURER_ASSIGN_SUPERVISOR}>
							Assign Supervisor
						</Link>
					),
				},
			],
		},
	];

	const lecturerMenuItems = canAccessModeratorFeatures
		? [...basicMenuItems, ...moderatorMenuItems]
		: basicMenuItems;

	return (
		<div className="h-full bg-white border-r border-gray-200">
			<div className="p-4">
				<h2 className="text-lg font-semibold text-gray-800 mb-4">
					👨‍🏫 Lecturer Portal
					{canAccessModeratorFeatures && (
						<Badge
							count="Moderator"
							color="gold"
							size="small"
							className="ml-2"
						/>
					)}
				</h2>
				<Menu
					mode="inline"
					selectedKeys={[pathname]}
					items={lecturerMenuItems}
					className="border-0"
				/>
			</div>
		</div>
	);
}
