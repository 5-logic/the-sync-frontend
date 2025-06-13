'use client';

import Footer from '../Footer';
import { HeaderSection } from '../Header';
import { Layout, theme } from 'antd';
import React from 'react';

import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useAppStore } from '@/store/useAppStore';

import { CollapsibleLayoutProps } from './CollapsibleLayout.types';
import { MobileBackdrop } from './MobileBackdrop';
import { SidebarSection } from './SidebarSection';

const { Content } = Layout;

const CollapsibleLayout: React.FC<CollapsibleLayoutProps> = ({
	children,
	sidebar,
}) => {
	const { sidebarCollapsed, toggleSidebar, setSidebarCollapsed } =
		useAppStore();
	const { isMobile } = useResponsiveLayout();

	const {
		token: { colorBgContainer, borderRadiusLG },
	} = theme.useToken();

	const handleMobileMenuClick = () => {
		// Auto close sidebar on mobile when clicking menu items
		if (isMobile) {
			setSidebarCollapsed(true);
		}
	};
	return (
		<div
			style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
		>
			<Layout style={{ flex: 1 }}>
				{/* Mobile Backdrop Overlay */}
				<MobileBackdrop
					isVisible={isMobile && !sidebarCollapsed}
					onClose={() => setSidebarCollapsed(true)}
				/>

				{/* Sidebar */}
				<SidebarSection
					collapsed={sidebarCollapsed}
					isMobile={isMobile}
					onMenuClick={handleMobileMenuClick}
				>
					{sidebar}
				</SidebarSection>

				{/* Main Layout */}
				<Layout
					style={{
						marginLeft: isMobile ? 0 : sidebarCollapsed ? 80 : 250,
						transition: 'margin-left 0.2s',
					}}
				>
					{/* Header */}
					<HeaderSection
						collapsed={sidebarCollapsed}
						onToggle={toggleSidebar}
						colorBgContainer={colorBgContainer}
					/>
					{/* Content */}
					<Content
						style={{
							margin: '24px 16px 24px 16px',
							padding: 24,
							minHeight: 'calc(100vh - 164px)', // Adjusted for header + footer
							background: colorBgContainer,
							borderRadius: borderRadiusLG,
							overflow: 'auto',
						}}
					>
						{children}
					</Content>
				</Layout>
			</Layout>

			{/* Footer - Outside main layout to span full width */}
			<Footer />
		</div>
	);
};

export default CollapsibleLayout;
