'use client';

import { CheckCircleFilled, ClockCircleOutlined } from '@ant-design/icons';
import { Card, Col, Progress, Row, Space, Typography } from 'antd';

import { timeline } from '@/data/timeline';

const { Title, Text } = Typography;

export default function TimelineStats() {
	const completedCount = timeline.filter(
		(item) => item.status === 'completed',
	).length;

	const inProgressCount = timeline.filter(
		(item) => item.status === 'inProgress',
	).length;

	const totalReviews = timeline.length - 1; // Exclude 'Start'
	const overallProgress = Math.round((completedCount / totalReviews) * 100);

	return (
		<Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
			<Col span={8}>
				<Card className="text-center">
					<CheckCircleFilled style={{ fontSize: 24, color: '#52c41a' }} />
					<Title level={3}>{completedCount}</Title>
					<Text>Reviews Completed</Text>
				</Card>
			</Col>
			<Col span={8}>
				<Card className="text-center">
					<ClockCircleOutlined style={{ fontSize: 24, color: '#1890ff' }} />
					<Title level={3}>{inProgressCount}</Title>
					<Text>Review in Progress</Text>
				</Card>
			</Col>
			<Col span={8}>
				<Card className="text-center">
					<Space direction="vertical" align="center">
						<Progress type="circle" percent={overallProgress} width={60} />
						<Text>Overall Progress</Text>
					</Space>
				</Card>
			</Col>
		</Row>
	);
}
