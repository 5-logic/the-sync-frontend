import { Progress } from 'antd';

import { progressOverview } from '@/data/moderatorStats';

export function ProgressOverview() {
	return (
		<div className="bg-white p-4 rounded shadow">
			<h3 className="text-lg font-semibold mb-2">Semester Progress Overview</h3>
			<p className="text-gray-500 mb-4">
				Track the overall progress of thesis management this semester.
			</p>
			<div className="space-y-4">
				{progressOverview.map((item) => (
					<div key={item.label}>
						<p className="text-sm font-medium text-gray-700 mb-1">
							{item.label}
						</p>
						<Progress
							percent={item.percent}
							strokeColor={item.color}
							showInfo={false}
						/>
					</div>
				))}
			</div>
		</div>
	);
}
