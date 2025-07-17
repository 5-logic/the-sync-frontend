import StatCard from '../Dashboard/StatCard';
import { Space } from 'antd';

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
