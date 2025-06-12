import Image from 'next/image';
import React from 'react';
import { IoMdNotificationsOutline } from 'react-icons/io';

const Logo = () => (
	<div className="flex items-center space-x-2">
		<Image
			src="/images/Logo.png"
			alt="TheSync Logo"
			width={32}
			height={32}
			className="w-8 h-8 object-contain"
			priority
		/>
		<span className="text-2xl font-bold text-blue-700">TheSync</span>
	</div>
);

const NotificationIcon = () => (
	<button className="relative text-gray-600 hover:text-blue-600 transition">
		<IoMdNotificationsOutline size={24} />
		<span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
	</button>
);

const AdminInfo = () => (
	<div className="flex items-center space-x-2">
		<Image
			src="/images/Avatar.png"
			alt="Admin Avatar"
			width={32}
			height={32}
			className="w-8 h-8 rounded-full object-cover"
		/>
		<div className="text-sm text-gray-700">
			<p className="font-medium">Admin</p>
		</div>
	</div>
);

const Header: React.FC = () => {
	return (
		<div className="fixed top-0 left-0 w-full h-12 bg-white shadow z-50 flex items-center justify-between px-6">
			<Logo />
			<div className="flex items-center space-x-4">
				<NotificationIcon />
				<AdminInfo />
			</div>
		</div>
	);
};

export default Header;
