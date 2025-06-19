'use client';

import { Tabs } from 'antd';

type Props = {
	activeTab: string;
	setActiveTab: (key: string) => void;
};

const tabs = [
	{ key: 'manual', label: 'Manual Input' },
	{ key: 'excel', label: 'Import from Excel' },
];

const TabNavigation = ({ activeTab, setActiveTab }: Props) => {
	return (
		<Tabs
			activeKey={activeTab}
			onChange={setActiveTab}
			items={tabs.map((tab) => ({
				key: tab.key,
				label: tab.label,
			}))}
		/>
	);
};

export default TabNavigation;
