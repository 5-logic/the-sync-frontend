'use client';

import { Steps } from 'antd';

const items: {
	title: string;
	status: 'finish' | 'process' | 'wait' | 'error';
}[] = [
	{
		title: 'Submit Thesis',
		status: 'finish',
	},
	{
		title: 'Review 1',
		status: 'finish',
	},
	{
		title: 'Review 2',
		status: 'process',
	},
	{
		title: 'Review 3',
		status: 'wait',
	},
	{
		title: 'Final Report',
		status: 'wait',
	},
];

export default function MilestoneStep() {
	return (
		<div className="bg-white p-4 rounded-xl shadow mb-4">
			<Steps
				size="small"
				current={2}
				items={items.map((item) => ({
					title: item.title,
					status: item.status,
				}))}
			/>
			<div className="mt-2 text-blue-600">
				Milestone 3 submission due in 7 days
			</div>
		</div>
	);
}
