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

interface LecturerProgressOverviewCardProps {
	readonly thesisId?: string;
	readonly hideTrackMilestones?: boolean;
}

// Shared styles
const cardStyle = {
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'space-between',
} as const;

const milestoneInfoStyle = { marginTop: 4 };
const timeRemainingStyle = { fontSize: 12 };

// Reusable components
const ProgressCard = ({ children }: { children: React.ReactNode }) => (
	<Card title="Progress Overview" style={cardStyle}>
		{children}
	</Card>
);

const MilestoneInfo = ({
	type,
	label,
	name,
	timeText,
}: {
	type: 'success' | 'warning';
	label: string;
	name: string;
	timeText: string;
}) => (
	<div style={{ marginBottom: type === 'success' ? 12 : 16 }}>
		<Text type={type}>
			{label}: {name}
		</Text>
		<div style={milestoneInfoStyle}>
			<Text type="secondary" style={timeRemainingStyle}>
				{timeText}
			</Text>
		</div>
	</div>
);

export default function LecturerProgressOverviewCard({
	thesisId,
	hideTrackMilestones = false,
}: LecturerProgressOverviewCardProps) {
	const router = useRouter();
	const { milestones, loading } = useMilestoneProgress();

	const handleTrackMilestones = () => {
		router.push('/lecturer/group-progress');
	};

	const handleViewThesisDetails = () => {
		if (thesisId) {
			router.push(`/lecturer/thesis-management/${thesisId}`);
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
			<ProgressCard>
				<div style={{ textAlign: 'center', padding: '20px 0' }}>
					<Spin size="small" />
				</div>
			</ProgressCard>
		);
	}

	if (!milestones.length) {
		return (
			<ProgressCard>
				<div style={{ textAlign: 'center', color: '#999' }}>
					No milestones found for current semester
				</div>
			</ProgressCard>
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
		<ProgressCard>
			<div>
				{currentMilestone && (
					<MilestoneInfo
						type="success"
						label="Current milestone"
						name={currentMilestone.name}
						timeText={`${getTimeRemaining(currentMilestone.endDate)} remaining`}
					/>
				)}

				{nextMilestone && (
					<MilestoneInfo
						type="warning"
						label="Next milestone"
						name={nextMilestone.name}
						timeText={`${getTimeRemaining(nextMilestone.startDate)} to start`}
					/>
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
		</ProgressCard>
	);
}
