'use client';

import { Button, Card, Progress, Timeline, Typography } from 'antd';

import { milestoneSchedule } from '@/data/milestoneSchedule';

const { Text } = Typography;

type MilestoneStatus = 'Completed' | 'In Progress' | 'Upcoming';

function getMilestoneStatus(
	dateString: string,
	index: number,
): MilestoneStatus {
	const now = new Date();
	const milestoneDate = new Date(dateString);

	if (milestoneDate < now) return 'Completed';
	if (index === getNextMilestoneIndex()) return 'In Progress';
	return 'Upcoming';
}

function getNextMilestoneIndex(): number {
	const now = new Date();
	for (let i = 0; i < milestoneSchedule.length; i++) {
		const milestoneDate = new Date(milestoneSchedule[i].date);
		if (milestoneDate > now) {
			return i;
		}
	}
	return milestoneSchedule.length - 1;
}

export default function ProgressOverviewCard() {
	const milestonesWithStatus = milestoneSchedule.map((m, index) => ({
		...m,
		status: getMilestoneStatus(m.date, index),
	}));

	const completedCount = milestonesWithStatus.filter(
		(m) => m.status === 'Completed',
	).length;

	const progressPercent = Math.round(
		(completedCount / milestoneSchedule.length) * 100,
	);

	const nextMilestone = milestonesWithStatus.find(
		(m) => m.status === 'In Progress' || m.status === 'Upcoming',
	);

	const getTimelineColor = (status: MilestoneStatus): string => {
		switch (status) {
			case 'Completed':
				return 'green';
			case 'In Progress':
				return 'gold';
			case 'Upcoming':
				return '#d9d9d9';
			default:
				return 'gray';
		}
	};

	return (
		<Card
			title="Progress Overview"
			style={{
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
			}}
		>
			<div>
				<Text type="warning">
					Upcoming milestone: {nextMilestone?.label} ({nextMilestone?.date})
				</Text>

				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						marginTop: 8,
					}}
				>
					<Text strong>Overall Progress</Text>
					<Text type="secondary">{progressPercent}%</Text>
				</div>

				<Progress
					percent={progressPercent}
					showInfo={false}
					style={{ marginBottom: 16 }}
				/>

				<Timeline>
					{milestonesWithStatus.map((milestone, index) => (
						<Timeline.Item
							key={index}
							color={getTimelineColor(milestone.status)}
						>
							<div>
								<Text strong>{milestone.label}</Text> –{' '}
								<Text type="secondary">{milestone.date}</Text>
							</div>
							<Text>Status: {milestone.status}</Text>
						</Timeline.Item>
					))}
				</Timeline>
			</div>

			<Button type="primary" block style={{ marginTop: 16 }}>
				View Thesis Details
			</Button>
		</Card>
	);
}
