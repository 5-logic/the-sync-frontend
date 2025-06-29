'use client';

import { CheckCircleFilled, ClockCircleOutlined } from '@ant-design/icons';
import { Card, Col, Row, Select, Space, Typography } from 'antd';
import { useState } from 'react';

import ProjectMilestone from '@/components/features/lecturer/TimelineReview/ProjectMilestone';
import ReviewGroupTable from '@/components/features/lecturer/TimelineReview/ReviewGroupTable';
import TimelineStats from '@/components/features/lecturer/TimelineReview/TimelineStats';
import { mockReviewGroups } from '@/data/group';
import { timeline } from '@/data/timeline';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function TimelineReview() {
	const [selectedReview, setSelectedReview] = useState<string | null>(null);

	return (
		<div style={{ padding: 24 }}>
			<Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
				<div>
					<Title level={2} style={{ marginBottom: '4px' }}>
						Timeline Review
					</Title>
					<Paragraph type="secondary" style={{ marginBottom: 0 }}>
						Review timeline, track specific capstone review timelines
					</Paragraph>
				</div>
				<Select defaultValue="Summer 2022" style={{ width: 160 }}>
					<Option value="summer2022">Summer 2022</Option>
					<Option value="spring2022">Spring 2022</Option>
				</Select>
			</Row>

			<Card style={{ marginBottom: 24 }}>
				<Row justify="space-between">
					{timeline.map((item, index) => {
						let statusIcon;
						let color;

						if (item.status === 'completed') {
							statusIcon = (
								<CheckCircleFilled style={{ color: 'green', fontSize: 20 }} />
							);
							color = 'green';
						} else if (item.status === 'inProgress') {
							statusIcon = (
								<ClockCircleOutlined
									style={{ color: '#1677ff', fontSize: 20 }}
								/>
							);
							color = '#1677ff';
						} else {
							statusIcon = (
								<div
									style={{
										width: 20,
										height: 20,
										borderRadius: '50%',
										background: '#ddd',
									}}
								/>
							);
							color = '#ccc';
						}

						const isSelected = selectedReview === item.title;

						return (
							<Col
								key={item.title}
								style={{
									textAlign: 'center',
									flex: 1,
									cursor: 'pointer',
									backgroundColor: isSelected ? '#f0f5ff' : 'transparent',
									borderRadius: 8,
									padding: 8,
									transition: 'background 0.3s',
								}}
								onClick={() => setSelectedReview(item.title)}
							>
								<Space direction="vertical" size={4} align="center">
									{statusIcon}
									<Text strong={isSelected}>{item.title}</Text>
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
			<ProjectMilestone />

			{selectedReview && mockReviewGroups[selectedReview] && (
				<ReviewGroupTable
					reviewTitle={selectedReview}
					data={mockReviewGroups[selectedReview]}
				/>
			)}
		</div>
	);
}
