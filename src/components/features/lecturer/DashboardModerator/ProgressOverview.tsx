'use client';

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
						{/* Label + Percentage in one row */}
						<div className="flex justify-between items-center mb-1">
							<p className="text-sm font-medium text-gray-700">{item.label}</p>
							<span className="text-sm font-semibold text-black">
								{item.percent}%
							</span>
						</div>

						{/* Progress bar */}
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
