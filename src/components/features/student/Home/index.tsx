'use client';

import { Col, Row, Space } from 'antd';

import { Header } from '@/components/common/Header';
import ProgressOverviewCard from '@/components/common/ProgressOverview/ProgressOverviewCard';
import { PageContentSkeleton } from '@/components/common/loading';
import StudentFirstLoginDashboard from '@/components/features/student/FirstLoginDashboard';
import GroupInfoCard from '@/components/features/student/GroupDashboard/GroupInfoCard';
import ThesisStatusCard from '@/components/features/student/GroupDashboard/ThesisStatusCard';
import { useStudentGroupStatus } from '@/hooks/student/useStudentGroupStatus';

export default function StudentHomePage() {
	const { hasGroup, group, loading, isLeader } = useStudentGroupStatus();

	// Show loading while fetching group status
	if (loading) {
		return <PageContentSkeleton />;
	}

	// If student doesn't have a group, show the FirstLoginDashboard
	if (!hasGroup) {
		return <StudentFirstLoginDashboard />;
	}

	// If student has a group, show the normal dashboard
	return (
		<Space direction="vertical" size="middle" style={{ width: '100%' }}>
			<Header
				title="Student Dashboard"
				description="This is your personal dashboard. Here you can track your group
						status, project milestones, and thesis progress."
			/>

			<Row gutter={[16, 16]}>
				<Col xs={24} md={8} style={{ flex: 1 }}>
					{group && <GroupInfoCard group={group} viewOnly isDashboardView />}
				</Col>
				<Col xs={24} md={8} style={{ flex: 1 }}>
					{group?.thesis?.id && (
						<ProgressOverviewCard thesisId={group.thesis.id} isDashboardView />
					)}
				</Col>
				<Col xs={24} md={8} style={{ flex: 1 }}>
					{group?.thesis?.id ? (
						<ThesisStatusCard
							thesisId={group.thesis.id}
							isLeader={isLeader}
							isDashboardView
						/>
					) : (
						<div>No thesis assigned yet</div>
					)}
				</Col>
			</Row>
		</Space>
	);
}
