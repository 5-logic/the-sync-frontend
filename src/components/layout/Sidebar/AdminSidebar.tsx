'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { FaChalkboardTeacher } from 'react-icons/fa';
import { MdOutlineSettingsSuggest } from 'react-icons/md';
import { PiStudent } from 'react-icons/pi';
import { RiDashboard3Line } from 'react-icons/ri';
import { VscMilestone } from 'react-icons/vsc';

const links = [
	{
		href: '/dashboard',
		label: 'Dashboard',
		icon: <RiDashboard3Line size={20} />,
	},
	{
		href: '/students',
		label: 'Students Management',
		icon: <PiStudent size={20} />,
	},
	{
		href: '/lecturers',
		label: 'Lecturers Management',
		icon: <FaChalkboardTeacher size={20} />,
	},
	{
		href: '/milestones',
		label: 'Milestone Management',
		icon: <VscMilestone size={20} />,
	},
	{
		href: '/semesters',
		label: 'Semester Settings',
		icon: <MdOutlineSettingsSuggest size={20} />,
	},
];

const AdminSidebar: React.FC = () => {
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

export default AdminSidebar;
