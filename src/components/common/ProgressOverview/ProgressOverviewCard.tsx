'use client';

import { Button, Card, Spin, Timeline, Typography } from 'antd';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';

import { useMilestoneProgress } from '@/hooks/student';
import {
	formatDate,
	getMilestoneStatus,
	getTimeRemaining,
} from '@/lib/utils/dateFormat';

const { Text } = Typography;

type MilestoneStatus = 'Ended' | 'In Progress' | 'Upcoming';

interface ProgressOverviewCardProps {
	readonly thesisId?: string;
	readonly hideTrackMilestones?: boolean;
}

export default function ProgressOverviewCard({
	thesisId,
	hideTrackMilestones = false,
}: ProgressOverviewCardProps) {
	const router = useRouter();
	const { milestones, loading } = useMilestoneProgress();

	const handleTrackMilestones = () => {
		router.push('/student/track-progress');
	};

	const handleViewThesisDetails = () => {
		if (thesisId) {
			router.push(`/student/list-thesis/${thesisId}`);
		}
	};

	const getTimelineColor = (status: MilestoneStatus): string => {
		switch (status) {
			case 'Ended':
				return 'green';
			case 'In Progress':
				return 'gold';
			case 'Upcoming':
				return '#d9d9d9';
			default:
				return 'gray';
		}
	};

	if (loading) {
		return (
			<Card
				title="Progress Overview"
				style={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-between',
				}}
			>
				<div style={{ textAlign: 'center', padding: '20px 0' }}>
					<Spin size="small" />
				</div>
			</Card>
		);
	}

	if (!milestones.length) {
		return (
			<Card
				title="Progress Overview"
				style={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-between',
				}}
			>
				<div style={{ textAlign: 'center', color: '#999' }}>
					No milestones found for current semester
				</div>

				{/* Show View Thesis Details button even when no milestones */}
				<div style={{ marginTop: 16 }}>
					<Button
						type="primary"
						block
						onClick={handleViewThesisDetails}
						disabled={!thesisId}
					>
						View Thesis Details
					</Button>
				</div>
			</Card>
		);
	}

	// Sort milestones by start date
	const sortedMilestones = [...milestones].sort((a, b) =>
		dayjs(a.startDate).isBefore(dayjs(b.startDate)) ? -1 : 1,
	);

	// Find next upcoming milestone (not the current in-progress one)
	const nextMilestone = sortedMilestones.find((milestone) => {
		const status = getMilestoneStatus(milestone.startDate, milestone.endDate);
		return status === 'Upcoming';
	});

	// Find current milestone if any
	const currentMilestone = sortedMilestones.find((milestone) => {
		const status = getMilestoneStatus(milestone.startDate, milestone.endDate);
		return status === 'In Progress';
	});

	return (
		<Card
			title="Progress Overview"
			style={{
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
			}}
		>
			<div>
				{currentMilestone && (
					<div style={{ marginBottom: 12 }}>
						<Text type="success">
							Current milestone: {currentMilestone.name}
						</Text>
						<div style={{ marginTop: 4 }}>
							<Text type="secondary" style={{ fontSize: 12 }}>
								{getTimeRemaining(currentMilestone.endDate)} remaining
							</Text>
						</div>
					</div>
				)}

				{nextMilestone && (
					<div style={{ marginBottom: 16 }}>
						<Text type="warning">Next milestone: {nextMilestone.name}</Text>
						<div style={{ marginTop: 4 }}>
							<Text type="secondary" style={{ fontSize: 12 }}>
								{getTimeRemaining(nextMilestone.startDate)} to start
							</Text>
						</div>
					</div>
				)}

				<Timeline>
					{sortedMilestones.map((milestone) => {
						const status = getMilestoneStatus(
							milestone.startDate,
							milestone.endDate,
						);
						return (
							<Timeline.Item
								key={milestone.id}
								color={getTimelineColor(status)}
							>
								<div>
									<Text strong>{milestone.name}</Text> –{' '}
									<Text type="secondary">
										{formatDate(milestone.startDate)} -{' '}
										{formatDate(milestone.endDate)}
									</Text>
								</div>
								<Text>Status: {status}</Text>
							</Timeline.Item>
						);
					})}
				</Timeline>
			</div>

			<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
				{!hideTrackMilestones && (
					<Button type="primary" block onClick={handleTrackMilestones}>
						Track Milestones
					</Button>
				)}
				<Button
					type={hideTrackMilestones ? 'primary' : 'default'}
					block
					onClick={handleViewThesisDetails}
					disabled={!thesisId}
				>
					View Thesis Details
				</Button>
			</div>
		</Card>
	);
}
