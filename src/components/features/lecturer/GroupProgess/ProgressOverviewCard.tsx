'use client';

import { Card, Progress, Space, Typography } from 'antd';

const { Text, Title } = Typography;

export default function ProgressOverviewCard() {
	// Mock data for progress overview
	const progressData = {
		overallProgress: 65,
		milestonesCompleted: 3,
		totalMilestones: 5,
		daysRemaining: 14,
	};

	return (
		<Card title="Progress Overview" style={{ height: '100%' }}>
			<Space direction="vertical" size="large" style={{ width: '100%' }}>
				<div>
					<Text type="secondary">Overall Progress</Text>
					<Progress
						percent={progressData.overallProgress}
						strokeColor={{
							'0%': '#108ee9',
							'100%': '#87d068',
						}}
					/>
				</div>

				<div>
					<Title level={4} style={{ margin: 0 }}>
						{progressData.milestonesCompleted}/{progressData.totalMilestones}
					</Title>
					<Text type="secondary">Milestones Completed</Text>
				</div>

				<div>
					<Title level={4} style={{ margin: 0, color: '#ff4d4f' }}>
						{progressData.daysRemaining}
					</Title>
					<Text type="secondary">Days Remaining</Text>
				</div>
			</Space>
		</Card>
	);
}
