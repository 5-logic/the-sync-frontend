'use client';

import { Layout, theme } from 'antd';
import React from 'react';

import NavigationLoader from '@/components/common/NavigationLoader';
import { ContentLoader } from '@/components/common/loading';
import { CollapsibleLayoutProps } from '@/components/layout/CollapsibleLayout/CollapsibleLayout.types';
import { MobileBackdrop } from '@/components/layout/CollapsibleLayout/MobileBackdrop';
import { SidebarSection } from '@/components/layout/CollapsibleLayout/SidebarSection';
import Footer from '@/components/layout/Footer';
import { HeaderSection } from '@/components/layout/Header';
import { useResponsiveLayout } from '@/hooks/ui';
import { useAppStore } from '@/store/useAppStore';

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

	// Calculate main layout margin left
	const getMarginLeft = () => {
		if (isMobile) {
			return 0;
		}
		return sidebarCollapsed ? 80 : 250;
	};
	const mainLayoutMarginLeft = getMarginLeft();
	return (
		<NavigationLoader>
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
					</SidebarSection>{' '}
					{/* Main Layout */}
					<Layout
						style={{
							marginLeft: mainLayoutMarginLeft,
							transition: 'margin-left 0.2s',
						}}
					>
						{/* Header */}
						<HeaderSection
							collapsed={sidebarCollapsed}
							onToggle={toggleSidebar}
							colorBgContainer={colorBgContainer}
						/>{' '}
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
							<ContentLoader>{children}</ContentLoader>
						</Content>
					</Layout>
				</Layout>

				{/* Footer - Outside main layout to span full width */}
				<Footer />
			</div>
		</NavigationLoader>
	);
};

export default CollapsibleLayout;
