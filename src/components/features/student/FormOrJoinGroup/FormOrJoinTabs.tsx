'use client';

import { Tabs } from 'antd';
import { useCallback, useMemo } from 'react';

// Constants for better maintainability
const TAB_CONFIG = {
	JOIN: {
		key: 'join',
		label: 'Join Group',
	},
	CREATE: {
		key: 'create',
		label: 'Form New Group',
	},
} as const;

const TAB_STYLES = {
	container: {
		borderBottom: '1px solid #f0f0f0',
	},
	tabBar: {
		marginBottom: 0,
	},
} as const;

interface FormOrJoinTabsProps {
	readonly tabKey: string;
	readonly setTabKey: (key: string) => void;
}

/**
 * Tab component for switching between "Join Group" and "Form New Group" modes
 * @param props - Component props including active tab key and setter function
 * @returns React component with tab navigation
 */
export default function FormOrJoinTabs({
	tabKey,
	setTabKey,
}: FormOrJoinTabsProps) {
	const handleTabChange = useCallback(
		(key: string) => {
			setTabKey(key);
		},
		[setTabKey],
	);

	const tabItems = useMemo(() => [TAB_CONFIG.JOIN, TAB_CONFIG.CREATE], []);

	return (
		<Tabs
			activeKey={tabKey}
			onChange={handleTabChange}
			size="large"
			items={tabItems}
			style={TAB_STYLES.container}
			tabBarStyle={TAB_STYLES.tabBar}
		/>
	);
}
