'use client';

import {
	LogoutOutlined,
	SettingOutlined,
	UserOutlined,
} from '@ant-design/icons';
import { Avatar, Badge, Button, Dropdown, Layout, Typography } from 'antd';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

import LogoutButton from '@/components/common/LogoutButton';

const { Header } = Layout;
const { Text } = Typography;

export default function DashboardHeader() {
	const { data: session } = useSession();

	const userMenuItems = [
		{
			key: 'profile',
			icon: <UserOutlined />,
			label: <Link href="/profile">Profile</Link>,
		},
		{
			key: 'settings',
			icon: <SettingOutlined />,
			label: <Link href="/settings">Settings</Link>,
		},
		{
			type: 'divider' as const,
		},
		{
			key: 'logout',
			icon: <LogoutOutlined />,
			label: <LogoutButton type="text" size="small" />,
		},
	];

	return (
		<Header
			style={{
				padding: '0 24px',
				background: '#fff',
				borderBottom: '1px solid #f0f0f0',
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
			}}
		>
			{' '}
			{/* Logo/Title */}
			<div style={{ display: 'flex', alignItems: 'center' }}>
				<Image
					src="/images/TheSync_logo.png"
					alt="The Sync"
					width={32}
					height={32}
					style={{ marginRight: 16 }}
				/>
				<Text strong style={{ fontSize: 18 }}>
					The Sync
				</Text>
			</div>
			{/* User Menu */}
			<div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
				<Text type="secondary">Welcome, {session?.user?.name}</Text>

				{session?.user?.isModerator && <Badge count="Moderator" color="gold" />}

				<Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
					<Button type="text" style={{ padding: 0 }}>
						<Avatar icon={<UserOutlined />} />
					</Button>
				</Dropdown>
			</div>
		</Header>
	);
}
