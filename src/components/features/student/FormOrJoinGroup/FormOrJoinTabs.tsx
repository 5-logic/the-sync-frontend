'use client';

import { Tabs } from 'antd';
import { useCallback, useMemo } from 'react';

type FormOrJoinTabsProps = {
	tabKey: string;
	setTabKey: (key: string) => void;
};

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

	const tabItems = useMemo(
		() => [
			{
				key: 'join',
				label: 'Join Group',
			},
			{
				key: 'create',
				label: 'Form New Group',
			},
		],
		[],
	);

	return (
		<Tabs
			activeKey={tabKey}
			onChange={handleTabChange}
			size="large"
			items={tabItems}
			style={{
				borderBottom: '1px solid #f0f0f0',
			}}
			tabBarStyle={{
				marginBottom: 0,
			}}
		/>
	);
}
