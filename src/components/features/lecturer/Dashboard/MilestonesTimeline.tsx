import { Card, Timeline } from 'antd';
import React from 'react';

import { mockMilestoneDetails } from '@/data/milestone';

const MilestonesTimeline: React.FC = () => {
	const getColor = (status: string) => {
		switch (status) {
			case 'Ended':
				return 'green';
			case 'In Progress':
				return 'blue';
			case 'Upcoming':
			default:
				return 'gray';
		}
	};

	return (
		<Card title="Milestones Timeline">
			<Timeline>
				{mockMilestoneDetails.map((item) => (
					<Timeline.Item color={getColor(item.status)} key={item.id}>
						<div>
							<strong>{item.title}</strong> — {item.date}
						</div>
						<div style={{ marginTop: 4, fontSize: '12px', color: '#666' }}>
							Status: {item.status}
							{item.submitted && (
								<span style={{ marginLeft: 8 }}>✓ Submitted</span>
							)}
						</div>
						{item.feedback && (
							<div
								style={{ marginTop: 4, fontSize: '12px', fontStyle: 'italic' }}
							>
								Feedback: {item.feedback}
							</div>
						)}
					</Timeline.Item>
				))}
			</Timeline>
		</Card>
	);
};

export default MilestonesTimeline;
