'use client';

import { Col, Row, Space } from 'antd';

import { Header } from '@/components/common/Header';
import GroupInformationCard from '@/components/features/student/Home/GroupInformationCard';
import ProjectMilestonesCard from '@/components/features/student/Home/ProjectMilestonesCard';
import ThesisStatusCard from '@/components/features/student/Home/ThesisStatusCard';
import { studentGroup } from '@/data/studentGroup';

export default function StudentHomePage() {
	return (
		<Space direction="vertical" size="middle" style={{ width: '100%' }}>
			<Header
				title="Student Dashboard"
				description="This is your personal dashboard. Here you can track your group
						status, project milestones, and thesis progress."
			/>

			<Row gutter={[16, 16]}>
				<Col xs={24} md={8} style={{ flex: 1 }}>
					<GroupInformationCard group={studentGroup} />
					{/* test with no group */}
					{/* <ThesisStatusCard group={null} /> */}
				</Col>
				<Col xs={24} md={8} style={{ flex: 1 }}>
					<ProjectMilestonesCard group={studentGroup} />
				</Col>
				<Col xs={24} md={8} style={{ flex: 1 }}>
					<ThesisStatusCard group={studentGroup} />
					{/* test with no group */}
					{/* <ThesisStatusCard group={null} /> */}
				</Col>
			</Row>
		</Space>
	);
}
