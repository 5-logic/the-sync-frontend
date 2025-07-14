'use client';

import { Button, Card, Progress, Timeline } from 'antd';

export default function ProgressOverviewCard() {
	return (
		<Card title="Progress Overview" className="h-full">
			<p>
				<strong>Overall Progress</strong>
			</p>
			<Progress percent={40} />
			<Timeline className="mt-4">
				<Timeline.Item color="green">
					Review 1 - Ended on Dec 15, 2023
				</Timeline.Item>
				<Timeline.Item color="blue">
					Review 2 - In Progress (Due Feb 1, 2024)
				</Timeline.Item>
				<Timeline.Item color="gray">
					Review 3 - Upcoming (Mar 15, 2024)
				</Timeline.Item>
			</Timeline>
			<div className="mt-4 text-center">
				<Button type="primary">View Thesis Details</Button>
			</div>
		</Card>
	);
}
