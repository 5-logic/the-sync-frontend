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
			{/* Section: Page Header */}
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

			<Row justify="end" align="middle" style={{ marginBottom: 24 }}>
				<Col>
					<Text type="secondary">Spring Semester 2024</Text>
				</Col>
			</Row>

			<Row gutter={[16, 16]}>
				<Col xs={24} md={8}>
					<GroupInformationCard group={studentGroup} />
				</Col>
				<Col xs={24} md={8}>
					<ProjectMilestonesCard group={studentGroup} />
				</Col>
				<Col xs={24} md={8}>
					<ThesisStatusCard group={studentGroup} />
				</Col>
			</Row>
		</Space>
	);
}
