'use client';

import {
	LogoutOutlined,
	SettingOutlined,
	UserOutlined,
} from '@ant-design/icons';
import { Avatar, Dropdown, MenuProps, Modal } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

import { useSessionData } from '@/hooks/auth/useAuth';
import { useResponsiveLayout } from '@/hooks/ui';
import { AuthService } from '@/lib/services/auth';

const UserProfile: React.FC = () => {
	const { session } = useSessionData();
	const router = useRouter();
	const { isMobile } = useResponsiveLayout();

	const userName = session?.user?.fullName ?? session?.user?.name ?? 'User';
	const avatarSrc = session?.user?.image ?? '/images/user_avatar.png';

	const handleLogoutClick = () => {
		Modal.confirm({
			title: 'Confirm Logout',
			content: (
				<div>
					<p>Are you sure you want to logout?</p>
					<p className="text-sm text-gray-500 mt-2">
						You will be redirected to the login page.
					</p>
				</div>
			),
			okText: 'Yes, Logout',
			cancelText: 'Cancel',
			okType: 'danger',
			icon: <LogoutOutlined />,
			maskClosable: true,
			closable: true,
			onOk: async () => {
				try {
					await AuthService.logout({ redirect: false });
					router.push('/login');
				} catch (error) {
					console.error('Logout error:', error);
				}
			},
		});
	};

	// Dynamic settings URL based on user role
	const getSettingsUrl = () => {
		const userRole = session?.user?.role;
		switch (userRole) {
			case 'student':
				return '/student/account-setting';
			case 'lecturer':
			case 'moderator':
				return '/lecturer/account-setting';
			case 'admin':
				return '/admin/account-setting';
			default:
				return '/account-setting'; // fallback
		}
	};

	const menuItems: MenuProps['items'] = [
		{
			key: 'profile',
			icon: <UserOutlined />,
			label: <Link href="/profile">Profile</Link>,
		},
		{
			key: 'settings',
			icon: <SettingOutlined />,
			label: <Link href={getSettingsUrl()}>Settings</Link>,
		},
		{
			type: 'divider',
		},
		{
			key: 'logout',
			icon: <LogoutOutlined />,
			label: 'Logout',
			onClick: handleLogoutClick,
		},
	];

	return (
		<Dropdown
			menu={{ items: menuItems }}
			placement="bottomRight"
			trigger={['click']}
			arrow
		>
			<div className="flex items-center cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors">
				{session?.user?.image ? (
					<Image
						src={avatarSrc}
						alt={`${userName} Avatar`}
						width={32}
						height={32}
						className="w-8 h-8 rounded-full object-cover"
					/>
				) : (
					<Avatar icon={<UserOutlined />} size={32} />
				)}
				{!isMobile && (
					<div className="text-sm text-gray-700 ml-3">
						<p className="font-medium">{userName}</p>
					</div>
				)}
			</div>
		</Dropdown>
	);
};

export default UserProfile;
