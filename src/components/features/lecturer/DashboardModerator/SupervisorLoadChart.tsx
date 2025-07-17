import { Bar } from '@ant-design/plots';

import { supervisorLoadData } from '@/data/moderatorStats';

export function SupervisorLoadChart() {
	const config = {
		data: supervisorLoadData,
		xField: 'count',
		yField: 'name',
		seriesField: 'category',
		color: ({ category }) => {
			switch (category) {
				case 'Over Load':
					return '#f5222d';
				case 'High Load':
					return '#fa8c16';
				case 'Moderate Load':
					return '#1890ff';
				case 'Low Load':
					return '#52c41a';
				default:
					return '#d9d9d9';
			}
		},
		legend: false,
		height: 300,
	};

	return (
		<div className="bg-white p-4 rounded shadow">
			<h3 className="text-lg font-semibold mb-2">
				Supervisor Load Distribution
			</h3>
			<p className="text-gray-500 mb-4">
				Number of groups assigned to each supervisor (Max load: 5 groups)
			</p>
			<Bar {...config} />
		</div>
	);
}
