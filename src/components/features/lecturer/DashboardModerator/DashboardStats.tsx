import { Space } from 'antd';

import { StatCard } from '@/components/lecturer/StatCard';
import { moderatorStats } from '@/data/moderatorStats';

export function DashboardStats() {
	return (
		<Space direction="horizontal" wrap size="middle">
			{moderatorStats.map((stat) => (
				<StatCard
					key={stat.title}
					icon={stat.icon}
					title={stat.title}
					value={stat.value}
				/>
			))}
		</Space>
	);
}
