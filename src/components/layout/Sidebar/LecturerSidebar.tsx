'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { MdOutlineSettingsSuggest } from 'react-icons/md';
import { MdOutlineTopic } from 'react-icons/md';
import { MdOutlineAssignmentReturn } from 'react-icons/md';
import { RiBarChartGroupedLine } from 'react-icons/ri';
import { RiDashboard3Line } from 'react-icons/ri';

const links = [
	{
		href: '/dashboard',
		label: 'Dashboard',
		icon: <RiDashboard3Line size={20} />,
	},
	{
		href: '/thesis',
		label: 'Thesis',
		icon: <MdOutlineTopic size={20} />,
	},
	{
		href: '/group-progress',
		label: 'Group Progress',
		icon: <RiBarChartGroupedLine size={20} />,
	},
	{
		href: '/assign-supervisors',
		label: 'Assign Supervisors',
		icon: <MdOutlineAssignmentReturn size={20} />,
	},
	{
		href: '/assign-students',
		label: 'Assign Students',
		icon: <MdOutlineAssignmentReturn size={20} />,
	},
	{
		href: '/profile-settings',
		label: 'Profile Settings',
		icon: <MdOutlineSettingsSuggest size={20} />,
	},
];

const LecturerSidebar: React.FC = () => {
	const pathname = usePathname();

	return (
		<aside className="w-60 bg-white shadow-md min-h-screen p-5">
			<nav className="space-y-3">
				{links.map((link) => {
					const isActive = pathname === link.href;
					return (
						<Link
							key={link.href}
							href={link.href}
							className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm whitespace-nowrap overflow-hidden text-ellipsis transition-colors ${
								isActive
									? 'bg-blue-200 text-blue-700 font-semibold'
									: 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
							}`}
						>
							<span>{link.icon}</span>
							<span>{link.label}</span>
						</Link>
					);
				})}
			</nav>
		</aside>
	);
};

export default LecturerSidebar;
