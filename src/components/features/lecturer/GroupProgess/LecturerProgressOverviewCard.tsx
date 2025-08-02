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

// Shared styles and utilities
const cardStyle = {
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'space-between',
} as const;

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

// Reusable components
const ProgressCard = ({ children }: { children: React.ReactNode }) => (
	<Card title="Progress Overview" style={cardStyle}>
		{children}
	</Card>
);

const ButtonGroup = ({
	hideTrackMilestones,
	onTrackMilestones,
	onViewThesisDetails,
	thesisId,
}: {
	hideTrackMilestones: boolean;
	onTrackMilestones: () => void;
	onViewThesisDetails: () => void;
	thesisId?: string;
}) => (
	<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
		{!hideTrackMilestones && (
			<Button type="primary" block onClick={onTrackMilestones}>
				Track Milestones
			</Button>
		)}
		<Button
			type={hideTrackMilestones ? 'primary' : 'default'}
			block
			onClick={onViewThesisDetails}
			disabled={!thesisId}
		>
			View Thesis Details
		</Button>
	</div>
);

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

	// Sort milestones by start date and add status to each
	const sortedMilestones = [...milestones]
		.sort((a, b) => (dayjs(a.startDate).isBefore(dayjs(b.startDate)) ? -1 : 1))
		.map((milestone) => ({
			...milestone,
			status: getMilestoneStatus(milestone.startDate, milestone.endDate),
		}));

	// Find milestones by status
	const currentMilestone = sortedMilestones.find(
		(m) => m.status === 'In Progress',
	);
	const nextMilestone = sortedMilestones.find((m) => m.status === 'Upcoming');

	return (
		<ProgressCard>
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
					{sortedMilestones.map((milestone) => (
						<Timeline.Item
							key={milestone.id}
							color={getTimelineColor(milestone.status)}
						>
							<TimelineItemContent
								milestone={milestone}
								status={milestone.status}
							/>
						</Timeline.Item>
					))}
				</Timeline>
			</div>

			<ButtonGroup
				hideTrackMilestones={hideTrackMilestones}
				onTrackMilestones={handleTrackMilestones}
				onViewThesisDetails={handleViewThesisDetails}
				thesisId={thesisId}
			/>
		</ProgressCard>
	);
}
