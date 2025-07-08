'use client';

import { Col, Row, Space, Typography } from 'antd';

import { studentGroup } from '@/data/studentGroup';

import GroupInformationCard from './GroupInformationCard';
import ProjectMilestonesCard from './ProjectMilestonesCard';
import ThesisStatusCard from './ThesisStatusCard';

export default function StudentHomePage() {
	const { Title, Paragraph, Text } = Typography;

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Row justify="start">
				<Col span={24}>
					<Title level={2} style={{ marginBottom: 4 }}>
						Student Dashboard
					</Title>
					<Paragraph type="secondary" style={{ marginBottom: 0 }}>
						This is your personal dashboard. Here you can track your group
						status, project milestones, and thesis progress.
					</Paragraph>
				</Col>
			</Row>

			<Row justify="end" align="middle" style={{ marginBottom: 0 }}>
				<Col>
					<Text type="secondary">Spring Semester 2024</Text>
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
