'use client';

import { CheckCircleFilled, ClockCircleOutlined } from '@ant-design/icons';
import { Card, Col, Row, Select, Space, Typography } from 'antd';

import TimelineStats from '@/components/features/lecturer/TimelineReview/TimelineStats';
import { timeline } from '@/data/timeline';

const { Title, Text } = Typography;
const { Option } = Select;

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

			<TimelineStats />

			<Card>
				<Title level={5}>Project Milestones</Title>
				<div style={{ display: 'flex', gap: 24 }}>
					<div>
						<span
							style={{
								display: 'inline-block',
								width: 12,
								height: 12,
								borderRadius: '50%',
								backgroundColor: '#52c41a',
								marginRight: 8,
							}}
						/>
						<Text>Completed</Text>
					</div>
					<div>
						<span
							style={{
								display: 'inline-block',
								width: 12,
								height: 12,
								borderRadius: '50%',
								backgroundColor: '#1890ff',
								marginRight: 8,
							}}
						/>
						<Text>In Progress</Text>
					</div>
					<div>
						<span
							style={{
								display: 'inline-block',
								width: 12,
								height: 12,
								borderRadius: '50%',
								backgroundColor: '#d9d9d9',
								marginRight: 8,
							}}
						/>
						<Text>Upcoming</Text>
					</div>
				</div>
			</Card>
		</div>
	);
}
