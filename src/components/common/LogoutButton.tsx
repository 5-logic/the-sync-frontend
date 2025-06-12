'use client';

import { LogoutOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface LogoutButtonProps {
	size?: 'small' | 'middle' | 'large';
	type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
	className?: string;
}

export default function LogoutButton({
	size = 'middle',
	type = 'default',
	className = '',
}: LogoutButtonProps) {
	const [loading, setLoading] = useState(false);
	const { data: session } = useSession();
	const router = useRouter();

	const handleLogoutConfirm = () => {
		Modal.confirm({
			title: '🔐 Confirm Logout',
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
			maskClosable: true,
			icon: <LogoutOutlined />,
			onOk: handleLogout,
			onCancel: () => {
				console.log('🚫 Logout cancelled');
			},
		});
	};

	const handleLogout = async () => {
		setLoading(true);
		try {
			console.log('🔐 Logging out user:', session?.user?.email);

			// NextAuth signOut
			await signOut({
				redirect: false, // Không tự động redirect
			});

			console.log('✅ Logout successful');

			// Manual redirect to login page
			router.push('/login');
		} catch (error) {
			console.error('❌ Logout error:', error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Button
			type={type}
			size={size}
			icon={<LogoutOutlined />}
			loading={loading}
			onClick={handleLogoutConfirm}
			className={className}
		>
			Logout
		</Button>
	);
}
