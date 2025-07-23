'use client';

import { ClockCircleOutlined } from '@ant-design/icons';
import { Card, Space, Spin, Steps } from 'antd';
import dayjs from 'dayjs';

import { useMilestoneProgress } from '@/hooks/student';
import {
	formatDate,
	getMilestoneStatus,
	getTimeRemaining,
} from '@/lib/utils/dateFormat';

export default function MilestoneStep() {
	const { milestones, loading } = useMilestoneProgress();

	if (loading) {
		return (
			<Card style={{ marginBottom: 16, textAlign: 'center' }}>
				<Spin size="small" />
			</Card>
		);
	}

	if (!milestones.length) {
		return (
			<Card style={{ marginBottom: 16 }}>
				<div style={{ textAlign: 'center', color: '#999' }}>
					No milestones found for current semester
				</div>
			</Card>
		);
	}

	// Sort milestones by start date
	const sortedMilestones = [...milestones].sort((a, b) =>
		dayjs(a.startDate).isBefore(dayjs(b.startDate)) ? -1 : 1,
	);

	// Find current milestone (first one that's in progress or upcoming)
	const currentMilestoneIndex = sortedMilestones.findIndex((milestone) => {
		const status = getMilestoneStatus(milestone.startDate, milestone.endDate);
		return status === 'In Progress' || status === 'Upcoming';
	});

	const currentStep =
		currentMilestoneIndex >= 0
			? currentMilestoneIndex
			: sortedMilestones.length - 1;

	const stepsData = sortedMilestones.map((milestone) => {
		const status = getMilestoneStatus(milestone.startDate, milestone.endDate);
		let stepStatus: 'finish' | 'process' | 'wait';

		if (status === 'Ended') stepStatus = 'finish';
		else if (status === 'In Progress') stepStatus = 'process';
		else stepStatus = 'wait';

		return {
			title: milestone.name,
			status: stepStatus,
		};
	});

	const nextDueMilestone = sortedMilestones.find((milestone) => {
		const status = getMilestoneStatus(milestone.startDate, milestone.endDate);
		return status === 'In Progress' || status === 'Upcoming';
	});

	return (
		<Card style={{ marginBottom: 16 }}>
			<Space direction="vertical" size="middle" style={{ width: '100%' }}>
				<Steps size="small" current={currentStep} items={stepsData} />

				{nextDueMilestone && (
					<div
						style={{
							border: '1px solid #91d5ff',
							backgroundColor: '#e6f7ff',
							borderRadius: 8,
							padding: '8px 12px',
							display: 'flex',
							alignItems: 'center',
							width: '100%',
						}}
					>
						<ClockCircleOutlined
							style={{ marginRight: 8, color: 'black', opacity: 0.8 }}
						/>
						<span style={{ color: 'black' }}>
							{nextDueMilestone.name} submission due on{' '}
							{formatDate(nextDueMilestone.endDate)} (
							{getTimeRemaining(nextDueMilestone.endDate)})
						</span>
					</div>
				)}
			</Space>
		</Card>
	);
}
