'use client';

import { Col, Row, Space } from 'antd';

import { Header } from '@/components/common/Header';
import { ProgressOverviewCard } from '@/components/common/ProgressOverview';
import MilestoneDetailCard from '@/components/features/student/TrackProgress/MilestoneDetailCard';
import MilestoneStep from '@/components/features/student/TrackProgress/MilestoneStep';
import { useGroupDashboardStore } from '@/store/useGroupDashboardStore';

export default function ProjectProgressPage() {
	console.log('🎯 TrackProgress component rendered');

	const { group } = useGroupDashboardStore();
	const thesisId = group?.thesis?.id;

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Header
				title="Track Progress"
				description="Track your thesis progress through each milestone. Upload files on time and view feedback from supervisors."
			/>
			<Row gutter={16}>
				<Col span={24}>
					<MilestoneStep />
				</Col>
			</Row>
			<Row gutter={16}>
				<Col xs={24} lg={16}>
					<MilestoneDetailCard />
				</Col>
				<Col xs={24} lg={8}>
					<ProgressOverviewCard hideTrackMilestones thesisId={thesisId} />
				</Col>
			</Row>
		</Space>
	);
}
