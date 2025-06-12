'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { GiArchiveRegister } from 'react-icons/gi';
import { IoHome } from 'react-icons/io5';
import { MdOutlineFormatListNumbered } from 'react-icons/md';
import { RiBarChartGroupedLine } from 'react-icons/ri';
import { RiDashboard3Line } from 'react-icons/ri';
import { VscGroupByRefType } from 'react-icons/vsc';

const links = [
	{
		href: '/home',
		label: 'Home',
		icon: <IoHome size={20} />,
	},
	{
		href: '/list-thesis',
		label: 'List Thesis',
		icon: <MdOutlineFormatListNumbered size={20} />,
	},
	{
		href: '/form-join-group',
		label: 'Form / Join Group',
		icon: <VscGroupByRefType size={20} />,
	},
	{
		href: '/register-thesis',
		label: 'Register Thesis',
		icon: <GiArchiveRegister size={20} />,
	},
	{
		href: '/track-progress',
		label: 'Track Progress',
		icon: <RiBarChartGroupedLine size={20} />,
	},
	{
		href: '/group-dashboard',
		label: 'Group Dashboard',
		icon: <RiDashboard3Line size={20} />,
	},
];

const StudentSidebar: React.FC = () => {
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

export default StudentSidebar;
