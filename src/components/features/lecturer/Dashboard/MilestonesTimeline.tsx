// components/MilestonesTimeline.tsx
import { Card, Timeline } from 'antd';
import React from 'react';

const MilestonesTimeline: React.FC = () => {
	const data = [
		{
			title: 'Proposal Submission',
			date: '2025-08-01',
			status: 'done',
		},
		{
			title: 'Proposal Defense',
			date: '2025-08-10',
			status: 'done',
		},
		{
			title: 'Midterm Report',
			date: '2025-09-01',
			status: 'processing',
		},
		{
			title: 'Final Defense',
			date: '2025-10-10',
			status: 'pending',
		},
		{
			title: 'Final Report Submission',
			date: '2025-10-20',
			status: 'pending',
		},
	];

	const getColor = (status: string) => {
		switch (status) {
			case 'done':
				return 'green';
			case 'processing':
				return 'blue';
			case 'pending':
			default:
				return 'gray';
		}
	};

	return (
		<Card title="Milestones Timeline">
			<Timeline>
				{data.map((item, idx) => (
					<Timeline.Item color={getColor(item.status)} key={idx}>
						<strong>{item.title}</strong> — {item.date}
					</Timeline.Item>
				))}
			</Timeline>
		</Card>
	);
};

export default MilestonesTimeline;
