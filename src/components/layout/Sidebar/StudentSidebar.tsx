'use client';

import {
	BookOutlined,
	CalendarOutlined,
	MessageOutlined,
	ReadOutlined,
	TeamOutlined,
	TrophyOutlined,
} from '@ant-design/icons';
import { Menu } from 'antd';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { DASHBOARD_PATHS } from '@/lib/auth/auth-constants';

const studentMenuItems = [
	{
		key: DASHBOARD_PATHS.STUDENT,
		icon: <TrophyOutlined />,
		label: <Link href={DASHBOARD_PATHS.STUDENT}>Dashboard</Link>,
	},
	{
		key: '/student/list-thesis',
		icon: <BookOutlined />,
		label: <Link href="/student/list-thesis">Thesis Topics</Link>,
	},
	{
		key: '/student/suggested-thesis',
		icon: <ReadOutlined />,
		label: <Link href="/student/suggested-thesis">Suggested Topics</Link>,
	},
	{
		key: '/student/group-dashboard',
		icon: <TeamOutlined />,
		label: <Link href="/student/group-dashboard">My Group</Link>,
	},
	{
		key: '/student/track-progress',
		icon: <CalendarOutlined />,
		label: <Link href="/student/track-progress">Track Progress</Link>,
	},
	{
		key: '/student/profile',
		icon: <MessageOutlined />,
		label: <Link href="/student/profile">Profile</Link>,
	},
];

export default function StudentSidebar() {
	const pathname = usePathname();

	return (
		<div className="h-full bg-white border-r border-gray-200">
			<div className="p-4">
				<h2 className="text-lg font-semibold text-gray-800 mb-4">
					🎓 Student Portal
				</h2>
				<Menu
					mode="inline"
					selectedKeys={[pathname]}
					items={studentMenuItems}
					className="border-0"
				/>
			</div>
		</div>
	);
}
