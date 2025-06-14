'use client';

type Props = {
	activeTab: string;
	setActiveTab: (key: string) => void;
};

const tabs = [
	{ key: 'manual', label: 'Manual Input' },
	{ key: 'excel', label: 'Import from Excel' },
];

const TabNavigation = ({ activeTab, setActiveTab }: Props) => (
	<div className="mb-6 -ml-8 border-b border-gray-200 text-left">
		<nav className="flex space-x-8">
			{tabs.map((tab) => (
				<button
					key={tab.key}
					onClick={() => setActiveTab(tab.key)}
					className={`pb-2 font-medium transition-colors duration-200 ${
						activeTab === tab.key
							? 'text-blue-600 border-b-2 border-blue-600'
							: 'text-gray-500 hover:text-blue-600'
					}`}
				>
					{tab.label}
				</button>
			))}
		</nav>
	</div>
);

export default TabNavigation;
