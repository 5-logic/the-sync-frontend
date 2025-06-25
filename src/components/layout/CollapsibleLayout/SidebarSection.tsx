import { Divider, Layout } from 'antd';
import Image from 'next/image';
import React from 'react';

import { SidebarSectionProps } from '@/components/layout/CollapsibleLayout/CollapsibleLayout.types';
import Logo from '@/components/layout/Header/Logo';

const { Sider } = Layout;

export const SidebarSection: React.FC<SidebarSectionProps> = ({
	collapsed,
	children,
	isMobile,
	onMenuClick,
}) => {
	return (
		<Sider
			trigger={null}
			collapsible
			collapsed={collapsed}
			width={250}
			theme="light"
			style={{
				overflow: 'hidden',
				height: '100vh',
				position: 'fixed',
				left: 0,
				top: 0,
				bottom: 0,
				zIndex: isMobile ? 1000 : 100,
				transition: 'all 0.2s',
				// On mobile: overlay behavior, on desktop: normal sidebar
				transform:
					isMobile && collapsed ? 'translateX(-100%)' : 'translateX(0)',
				boxShadow:
					isMobile && !collapsed ? '2px 0 8px rgba(0,0,0,0.15)' : 'none',
			}}
		>
			{/* Logo Section */}
			<div
				style={{
					height: 64,
					marginRight: 16,
					marginLeft: 16,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: 8,
				}}
			>
				{collapsed ? (
					// Only display logo image when collapsed
					<Image
						src="/images/thesync-logo.svg"
						alt="TheSync Logo"
						width={32}
						height={32}
						style={{ objectFit: 'contain' }}
					/>
				) : (
					// Display full logo component when expanded
					<Logo />
				)}
			</div>
			{/* Divider */}
			<div style={{ padding: '0 16px' }}>
				<Divider style={{ margin: '0 0 8px 0' }} />
			</div>
			{/* Sidebar Content */}
			<div
				onClick={onMenuClick}
				role="button"
				tabIndex={0}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						onMenuClick();
					}
				}}
				aria-label="Menu navigation"
			>
				{children}
			</div>
		</Sider>
	);
};
