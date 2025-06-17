import { Space, Typography } from 'antd';
import { ReactNode } from 'react';

interface LoginFormLayoutProps {
	readonly title: string;
	readonly children: ReactNode;
}

/**
 * 🎨 Login Form Layout Component
 * Shared layout for both admin and user login forms
 */
export default function LoginFormLayout({
	title,
	children,
}: LoginFormLayoutProps) {
	return (
		<Space
			direction="vertical"
			size="large"
			style={{ width: '100%', paddingTop: '1rem' }}
		>
			<Typography.Text
				style={{
					display: 'block',
					textAlign: 'center',
					color: '#6b7280',
				}}
			>
				{title}
			</Typography.Text>
			{children}
		</Space>
	);
}
