'use client';

import { CheckCircleFilled, ClockCircleOutlined } from '@ant-design/icons';
import { Card, Col, Progress, Row, Select, Space, Typography } from 'antd';

const { Title, Text } = Typography;
const { Option } = Select;

const timeline = [
	{ title: 'Start', dateRange: 'Dec 1 - Dec 15', status: 'completed' },
	{ title: 'Review 1', dateRange: 'Dec 15 - Dec 30', status: 'completed' },
	{ title: 'Review 2', dateRange: 'Feb 1 - Feb 15', status: 'inProgress' },
	{ title: 'Review 3', dateRange: 'Mar 15 - Mar 30', status: 'upcoming' },
	{ title: 'Final Review', dateRange: 'Apr 30 - Apr 30', status: 'upcoming' },
];

const completedCount = timeline.filter(
	(item) => item.status === 'completed',
).length;
const inProgressCount = timeline.filter(
	(item) => item.status === 'inProgress',
).length;

const totalReviews = timeline.length - 1;

const overallProgress = Math.round((completedCount / totalReviews) * 100);

export default function TimelineReview() {
	return (
		<div style={{ padding: 24 }}>
			<Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
				<Title level={3}>Timeline Review</Title>
				<Select defaultValue="Summer 2022" style={{ width: 160 }}>
					<Option value="summer2022">Summer 2022</Option>
					<Option value="spring2022">Spring 2022</Option>
				</Select>
			</Row>

			<Card style={{ marginBottom: 24 }}>
				<Row justify="space-between">
					{timeline.map((item, index) => {
						const statusIcon =
							item.status === 'completed' ? (
								<CheckCircleFilled style={{ color: 'green', fontSize: 20 }} />
							) : item.status === 'inProgress' ? (
								<ClockCircleOutlined
									style={{ color: '#1677ff', fontSize: 20 }}
								/>
							) : (
								<div
									style={{
										width: 20,
										height: 20,
										borderRadius: '50%',
										background: '#ddd',
									}}
								/>
							);

						const color =
							item.status === 'completed'
								? 'green'
								: item.status === 'inProgress'
									? '#1677ff'
									: '#ccc';

						return (
							<Col key={item.title} style={{ textAlign: 'center', flex: 1 }}>
								<Space direction="vertical" size={4} align="center">
									{statusIcon}
									<Text>{item.title}</Text>
									<Text type="secondary" style={{ fontSize: 12 }}>
										{item.dateRange}
									</Text>
								</Space>
								{index >= 0 && (
									<div
										style={{
											height: 2,
											background: color,
											margin: '12px auto',
											width: '80%',
										}}
									/>
								)}
							</Col>
						);
					})}
				</Row>
			</Card>

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

			<Card>
				<Title level={5}>Project Milestones</Title>
				<Space size="large">
					<div>
						<span
							className="inline-block w-3 h-3 rounded-full mr-2"
							style={{ backgroundColor: '#52c41a' }}
						/>
						<Text>Completed</Text>
					</div>
					<div>
						<span
							className="inline-block w-3 h-3 rounded-full mr-2"
							style={{ backgroundColor: '#1890ff' }}
						/>
						<Text>In Progress</Text>
					</div>
					<div>
						<span
							className="inline-block w-3 h-3 rounded-full mr-2"
							style={{ backgroundColor: '#d9d9d9' }}
						/>
						<Text>Upcoming</Text>
					</div>
				</Space>
			</Card>
		</div>
	);
}
