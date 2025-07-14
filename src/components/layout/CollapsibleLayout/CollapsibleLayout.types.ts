export interface CollapsibleLayoutProps {
	children: React.ReactNode;
	sidebar: React.ReactNode;
	showBreadcrumb?: boolean;
}

export interface SidebarSectionProps {
	collapsed: boolean;
	children: React.ReactNode;
	isMobile: boolean;
	onMenuClick: () => void;
}

export interface HeaderSectionProps {
	collapsed: boolean;
	onToggle: () => void;
	colorBgContainer: string;
}
