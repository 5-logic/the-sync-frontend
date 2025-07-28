'use client';

import { Button, Card, Spin, Timeline, Typography } from 'antd';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';

import {
	formatDate,
	getMilestoneStatus,
	getTimeRemaining,
} from '@/lib/utils/dateFormat';
import { Milestone } from '@/schemas/milestone';

const { Text } = Typography;

type MilestoneStatus = 'Ended' | 'In Progress' | 'Upcoming';

// Common styles to reduce duplication
const styles = {
	milestoneContainer: { marginBottom: 12 },
	nextMilestoneContainer: { marginBottom: 16 },
	timeContainer: { marginTop: 4 },
	timeText: { fontSize: 12 },
} as const;

// Reusable component for milestone display
interface MilestoneDisplayProps {
	readonly milestone: Milestone;
	readonly label: string;
	readonly timeLabel: string;
	readonly timeValue: string;
	readonly textType: 'success' | 'warning';
	readonly containerStyle?: React.CSSProperties;
}

const MilestoneDisplay: React.FC<MilestoneDisplayProps> = ({
	milestone,
	label,
	timeLabel,
	timeValue,
	textType,
	containerStyle = styles.milestoneContainer,
}) => (
	<div style={containerStyle}>
		<Text type={textType}>
			{label}: {milestone.name}
		</Text>
		<div style={styles.timeContainer}>
			<Text type="secondary" style={styles.timeText}>
				{timeValue} {timeLabel}
			</Text>
		</div>
	</div>
);

// Reusable component for timeline item content
interface TimelineItemContentProps {
	readonly milestone: Milestone;
	readonly status: MilestoneStatus;
}

const TimelineItemContent: React.FC<TimelineItemContentProps> = ({
	milestone,
	status,
}) => (
	<>
		<div>
			<Text strong>{milestone.name}</Text> –{' '}
			<Text type="secondary">
				{formatDate(milestone.startDate)} - {formatDate(milestone.endDate)}
			</Text>
		</div>
		<Text>Status: {status}</Text>
	</>
);

interface LecturerProgressOverviewCardProps {
	readonly thesisId?: string;
	readonly hideTrackMilestones?: boolean;
	readonly milestones?: Milestone[];
	readonly loading?: boolean;
}

export default function LecturerProgressOverviewCard({
	thesisId,
	hideTrackMilestones = false,
	milestones = [],
	loading = false,
}: LecturerProgressOverviewCardProps) {
	const router = useRouter();

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

	// Common card props
	const cardProps = {
		title: 'Progress Overview',
		style: {
			display: 'flex',
			flexDirection: 'column' as const,
			justifyContent: 'space-between',
		},
	};

	// Helper function for empty state cards
	const renderEmptyCard = (content: React.ReactNode) => (
		<Card {...cardProps}>
			<div style={{ textAlign: 'center' }}>{content}</div>
		</Card>
	);

	if (loading) {
		return renderEmptyCard(
			<div style={{ padding: '20px 0' }}>
				<Spin size="small" />
			</div>,
		);
	}

	if (!milestones.length) {
		return renderEmptyCard(
			<div style={{ color: '#999' }}>
				No milestones found for current semester
			</div>,
		);
	}

	// Sort milestones by start date
	const sortedMilestones = [...milestones].sort((a, b) =>
		dayjs(a.startDate).isBefore(dayjs(b.startDate)) ? -1 : 1,
	);

	// Helper function to get milestone status
	const getMilestoneStatusHelper = (milestone: Milestone) =>
		getMilestoneStatus(milestone.startDate, milestone.endDate);

	// Find next upcoming milestone (not the current in-progress one)
	const nextMilestone = sortedMilestones.find((milestone) => {
		return getMilestoneStatusHelper(milestone) === 'Upcoming';
	});

	// Find current milestone if any
	const currentMilestone = sortedMilestones.find((milestone) => {
		return getMilestoneStatusHelper(milestone) === 'In Progress';
	});

	return (
		<Card {...cardProps}>
			<div>
				{currentMilestone && (
					<MilestoneDisplay
						milestone={currentMilestone}
						label="Current milestone"
						timeLabel="remaining"
						timeValue={getTimeRemaining(currentMilestone.endDate)}
						textType="success"
					/>
				)}

				{nextMilestone && (
					<MilestoneDisplay
						milestone={nextMilestone}
						label="Next milestone"
						timeLabel="to start"
						timeValue={getTimeRemaining(nextMilestone.startDate)}
						textType="warning"
						containerStyle={styles.nextMilestoneContainer}
					/>
				)}

				<Timeline>
					{sortedMilestones.map((milestone) => {
						const status = getMilestoneStatusHelper(milestone);
						return (
							<Timeline.Item
								key={milestone.id}
								color={getTimelineColor(status)}
							>
								<TimelineItemContent milestone={milestone} status={status} />
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
