import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Button, Layout } from 'antd';
import React from 'react';

import { HeaderSectionProps } from '@/components/layout/CollapsibleLayout/CollapsibleLayout.types';
import { CurrentSemesterTag } from '@/components/layout/Header/CurrentSemesterTag';
import UserProfile from '@/components/layout/Header/UserProfile';

const { Header } = Layout;

export const HeaderSection: React.FC<HeaderSectionProps> = ({
	collapsed,
	onToggle,
	colorBgContainer,
}) => {
	return (
		<Header
			style={{
				padding: 0,
				background: colorBgContainer,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				boxShadow: '0 1px 4px rgba(0,21,41,.08)',
				zIndex: 50,
				position: 'sticky',
				top: 0,
			}}
		>
			<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
				<Button
					type="text"
					icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
					onClick={onToggle}
					style={{
						fontSize: '16px',
						width: 64,
						height: 64,
					}}
				/>

				{/* Current Semester Tag */}
				<CurrentSemesterTag />

				{/* Page Title Area */}
				<div
					style={{
						fontSize: 16,
						fontWeight: 500,
						color: '#434343',
					}}
				></div>
			</div>
			{/* User Actions */}
			<div
				style={{
					paddingRight: 24,
					display: 'flex',
					alignItems: 'center',
					gap: 2,
				}}
			>
				<UserProfile />
			</div>
		</Header>
	);
};
