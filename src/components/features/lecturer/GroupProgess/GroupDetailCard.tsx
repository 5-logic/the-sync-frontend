'use client';

import { Card, Col, Row, Space, Typography } from 'antd';
import { memo } from 'react';

import CardLoadingSkeleton from '@/components/common/loading/CardLoadingSkeleton';
import LecturerProgressOverviewCard from '@/components/features/lecturer/GroupProgess/LecturerProgressOverviewCard';
import GroupInfoCard from '@/components/features/student/GroupDashboard/GroupInfoCard';
import SupervisorInfoCard from '@/components/features/student/GroupDashboard/SupervisorInfoCard';
import ThesisStatusCard from '@/components/features/student/GroupDashboard/ThesisStatusCard';
import { SupervisedGroup } from '@/lib/services/groups.service';
import { GroupDashboard } from '@/schemas/group';
import { Milestone } from '@/schemas/milestone';

const { Title } = Typography;

interface GroupDetailCardProps {
	readonly group: SupervisedGroup | GroupDashboard;
	readonly loading?: boolean;
	readonly milestones?: Milestone[];
	readonly milestonesLoading?: boolean;
}

/**
 * Convert SupervisedGroup to GroupDashboard format for component compatibility
 */
function convertSupervisedGroupToGroupDashboard(
	supervisedGroup: SupervisedGroup,
): GroupDashboard {
	// Find the leader from participations
	const leaderParticipation = supervisedGroup.studentGroupParticipations?.find(
		(p) => p.isLeader,
	);

	return {
		id: supervisedGroup.id,
		name: supervisedGroup.name,
		code: supervisedGroup.code,
		projectDirection: supervisedGroup.projectDirection || '',
		createdAt: supervisedGroup.createdAt,
		updatedAt: supervisedGroup.updatedAt,
		semester: {
			id: supervisedGroup.semester.id,
			name: supervisedGroup.semester.name,
			code: supervisedGroup.semester.code,
			status: supervisedGroup.semester.status as
				| 'NotYet'
				| 'Preparing'
				| 'Picking'
				| 'Ongoing'
				| 'End',
			defaultThesesPerLecturer:
				supervisedGroup.semester.defaultThesesPerLecturer,
			maxThesesPerLecturer: supervisedGroup.semester.maxThesesPerLecturer,
		},
		thesis: supervisedGroup.thesis,
		leader: {
			userId: leaderParticipation?.student?.user?.id || '',
			studentCode: leaderParticipation?.student?.studentCode || '',
			user: {
				id: leaderParticipation?.student?.user?.id || '',
				createdAt: new Date(
					leaderParticipation?.student?.user?.createdAt || '',
				),
				updatedAt: new Date(
					leaderParticipation?.student?.user?.updatedAt || '',
				),
				fullName: leaderParticipation?.student?.user?.fullName || 'Unknown',
				email: leaderParticipation?.student?.user?.email || '',
				gender:
					(leaderParticipation?.student?.user?.gender as 'Male' | 'Female') ||
					'Male',
				phoneNumber: leaderParticipation?.student?.user?.phoneNumber || '',
				isActive: leaderParticipation?.student?.user?.isActive || true,
			},
			major: leaderParticipation?.student?.major || {
				id: '',
				name: 'Unknown',
				code: '',
				createdAt: '',
				updatedAt: '',
			},
			isLeader: true,
		},
		members:
			supervisedGroup.studentGroupParticipations?.map((participation) => ({
				userId: participation.student.user.id,
				studentCode: participation.student.studentCode,
				user: {
					id: participation.student.user.id,
					createdAt: new Date(participation.student.user.createdAt),
					updatedAt: new Date(participation.student.user.updatedAt),
					fullName: participation.student.user.fullName,
					email: participation.student.user.email,
					gender: participation.student.user.gender as 'Male' | 'Female',
					phoneNumber: participation.student.user.phoneNumber,
					isActive: participation.student.user.isActive,
				},
				major: participation.student.major,
				isLeader: participation.isLeader,
			})) || [],
		skills:
			supervisedGroup.groupRequiredSkills?.map((skillRelation) => ({
				id: skillRelation.skill.id,
				name: skillRelation.skill.name,
				skillSetId: skillRelation.skill.skillSetId,
				createdAt: new Date(skillRelation.skill.createdAt),
				updatedAt: new Date(skillRelation.skill.updatedAt),
				skillSet: {
					...skillRelation.skill.skillSet,
					createdAt: new Date(skillRelation.skill.skillSet.createdAt),
					updatedAt: new Date(skillRelation.skill.skillSet.updatedAt),
				},
			})) || [],
		responsibilities:
			supervisedGroup.groupExpectedResponsibilities?.map(
				(responsibilityRelation) => ({
					id: responsibilityRelation.responsibility.id,
					name: responsibilityRelation.responsibility.name,
					createdAt: new Date(responsibilityRelation.responsibility.createdAt),
					updatedAt: new Date(responsibilityRelation.responsibility.updatedAt),
				}),
			) || [],
		participation: {
			isLeader: leaderParticipation?.isLeader || false,
			semester: {
				id: supervisedGroup.semester.id,
				name: supervisedGroup.semester.name,
				code: supervisedGroup.semester.code,
				status: supervisedGroup.semester.status as
					| 'NotYet'
					| 'Preparing'
					| 'Picking'
					| 'Ongoing'
					| 'End',
				defaultThesesPerLecturer:
					supervisedGroup.semester.defaultThesesPerLecturer,
				maxThesesPerLecturer: supervisedGroup.semester.maxThesesPerLecturer,
			},
		},
	};
}

function GroupDetailCard({
	group,
	loading = false,
	milestones = [],
	milestonesLoading = false,
}: GroupDetailCardProps) {
	// Show skeleton loading when loading
	if (loading) {
		return <CardLoadingSkeleton />;
	}

	// Check if it's a SupervisedGroup or regular GroupDashboard
	const isSupervisedGroup = 'studentGroupParticipations' in group;

	// Convert SupervisedGroup to GroupDashboard if needed for compatibility
	const groupDashboard: GroupDashboard = isSupervisedGroup
		? convertSupervisedGroupToGroupDashboard(group)
		: (group as GroupDashboard);

	const hasThesis = groupDashboard.thesis !== null;
	const thesisId = groupDashboard.thesis?.id;

	return (
		<Card
			title={
				<Space>
					<Title level={4} style={{ margin: 0 }}>
						Group Details
					</Title>
				</Space>
			}
			data-testid="group-detail-card"
		>
			<Row gutter={[16, 16]}>
				{/* Left Column - Group Information and Supervisor Information */}
				<Col xs={24} lg={12}>
					<Space direction="vertical" size="middle" style={{ width: '100%' }}>
						{/* Group Information */}
						<GroupInfoCard group={groupDashboard} viewOnly={true} />

						{/* Supervisor Information */}
						{hasThesis && thesisId ? (
							<SupervisorInfoCard thesisId={thesisId} />
						) : (
							<Card title="Supervisor Information">
								<div style={{ textAlign: 'center', color: '#999' }}>
									No supervisor assigned yet
								</div>
							</Card>
						)}
					</Space>
				</Col>

				{/* Right Column - Thesis Status and Progress Overview */}
				<Col xs={24} lg={12}>
					<Space direction="vertical" size="middle" style={{ width: '100%' }}>
						{/* Thesis Status - Use ThesisStatusCard with direct data */}
						{(() => {
							if (isSupervisedGroup && hasThesis) {
								return (
									<ThesisStatusCard
										thesisData={(group as SupervisedGroup).thesis}
										isLeader={false} // Always false for lecturer view
										hideEditButton={true} // Hide edit button for lecturer view
									/>
								);
							}

							if (hasThesis) {
								return (
									<Card title="Thesis Status">
										<div style={{ textAlign: 'center', color: '#999' }}>
											Thesis information not available
										</div>
									</Card>
								);
							}

							return (
								<Card title="Thesis Status">
									<div style={{ textAlign: 'center', color: '#999' }}>
										No thesis assigned yet
									</div>
								</Card>
							);
						})()}

						{/* Progress Overview */}
						<LecturerProgressOverviewCard
							thesisId={thesisId}
							hideTrackMilestones={true}
							milestones={milestones}
							loading={milestonesLoading}
						/>
					</Space>
				</Col>
			</Row>
		</Card>
	);
}

// Memoize component để tránh unnecessary re-renders
export default memo(GroupDetailCard, (prevProps, nextProps) => {
	// Custom comparison để chỉ re-render khi cần thiết
	return (
		prevProps.loading === nextProps.loading &&
		prevProps.group.id === nextProps.group.id &&
		prevProps.group.updatedAt === nextProps.group.updatedAt
	);
});
