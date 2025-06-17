'use client';

import {
	BookOutlined,
	ClockCircleOutlined,
	CrownOutlined,
	DashboardOutlined,
	ScheduleOutlined,
	TeamOutlined,
	UserAddOutlined,
	UserOutlined,
} from '@ant-design/icons';
import { Badge, Menu } from 'antd';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { usePermissions } from '@/hooks/auth';
import { DASHBOARD_PATHS } from '@/lib/auth/config/auth-constants';

export default function LecturerSidebar() {
	const pathname = usePathname();
	const { canAccessModeratorFeatures } = usePermissions();

	const basicMenuItems = [
		{
			key: DASHBOARD_PATHS.LECTURER,
			icon: <DashboardOutlined />,
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
			key: '/lecturer/timeline-review',
			icon: <ClockCircleOutlined />,
			label: <Link href="/lecturer/timeline-review">Timeline Review</Link>,
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
					icon: <UserAddOutlined />,
					label: (
						<Link href={DASHBOARD_PATHS.LECTURER_ASSIGN_STUDENT_LIST}>
							Assign Student
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
				{
					key: '/lecturer/assign-lecturer-review',
					icon: <ScheduleOutlined />,
					label: (
						<Link href="/lecturer/assign-lecturer-review">
							Assign Lecturer Review
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
		<Menu
			theme="light"
			mode="inline"
			selectedKeys={[pathname]}
			items={lecturerMenuItems}
			style={{
				border: 'none',
				height: '100%',
			}}
		/>
	);
}
