'use client';

import { Col, Row, Space, Typography } from 'antd';

import { Header } from '@/components/common/Header';
import GroupInformationCard from '@/components/features/student/Home/GroupInformationCard';
import ProjectMilestonesCard from '@/components/features/student/Home/ProjectMilestonesCard';
import ThesisStatusCard from '@/components/features/student/Home/ThesisStatusCard';
import { studentGroup } from '@/data/studentGroup';

export default function StudentHomePage() {
	const { Text } = Typography;

	return (
		<Space direction="vertical" size="middle" style={{ width: '100%' }}>
			<Header
				title="Student Dashboard"
				description="This is your personal dashboard. Here you can track your group
						status, project milestones, and thesis progress."
			/>

			<Row justify="end" align="middle" style={{ marginBottom: 0 }}>
				<Col>
					<Text type="secondary">Semester Spring 2024</Text>
				</Col>
			</Row>

			<Row gutter={[16, 16]} style={{ display: 'flex' }}>
				<Col xs={24} md={8} style={{ display: 'flex' }}>
					<div style={{ flex: 1 }}>
						<GroupInformationCard group={studentGroup} />
						{/* test with no group */}
						{/* <GroupInformationCard group={null} /> */}
					</div>
				</Col>
				<Col xs={24} md={8} style={{ display: 'flex' }}>
					<div style={{ flex: 1 }}>
						<ProjectMilestonesCard group={studentGroup} />
					</div>
				</Col>
				<Col xs={24} md={8} style={{ display: 'flex' }}>
					<div style={{ flex: 1 }}>
						<ThesisStatusCard group={studentGroup} />
						{/* test with no group */}
						{/* <ThesisStatusCard group={null} /> */}
					</div>
				</Col>
			</Row>
		</Space>
	);
}
