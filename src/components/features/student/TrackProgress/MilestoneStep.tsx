'use client';

import { ClockCircleOutlined } from '@ant-design/icons';
import { Card, Space, Steps, Typography } from 'antd';

const { Text } = Typography;

const items: {
	title: string;
	status: 'finish' | 'process' | 'wait' | 'error';
}[] = [
	{
		title: 'Submit Thesis',
		status: 'finish',
	},
	{
		title: 'Review 1',
		status: 'finish',
	},
	{
		title: 'Review 2',
		status: 'process',
	},
	{
		title: 'Review 3',
		status: 'wait',
	},
	{
		title: 'Final Report',
		status: 'wait',
	},
];

export default function MilestoneStep() {
	return (
		<Card style={{ marginBottom: 16 }}>
			<Space direction="vertical" size="middle" style={{ width: '100%' }}>
				<Steps
					size="small"
					current={2}
					items={items.map((item) => ({
						title: item.title,
						status: item.status,
					}))}
				/>
				<Text type="secondary">
					<ClockCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
					<span style={{ color: '#1890ff' }}>
						Milestone 3 submission due in 7 days
					</span>
				</Text>
			</Space>
		</Card>
	);
}
