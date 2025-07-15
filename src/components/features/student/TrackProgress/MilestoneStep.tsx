'use client';

import { ClockCircleOutlined } from '@ant-design/icons';
import { Card, Space, Steps, Typography } from 'antd';

import { mockMilestoneDetails } from '@/data/milestone';

const { Text } = Typography;

export default function MilestoneStep() {
	// Duyệt qua danh sách milestone để tạo bước step
	const currentStep = mockMilestoneDetails.findIndex(
		(m) => m.status === 'In Progress',
	);

	const stepsData = mockMilestoneDetails.map((milestone) => ({
		title: milestone.title,
		status:
			milestone.status === 'Ended'
				? 'finish'
				: milestone.status === 'In Progress'
					? 'process'
					: 'wait',
	})) as { title: string; status: 'finish' | 'process' | 'wait' }[];

	// Lấy milestone đang in progress để hiển thị thông báo deadline
	const currentMilestone = mockMilestoneDetails[currentStep];

	return (
		<Card style={{ marginBottom: 16 }}>
			<Space direction="vertical" size="middle" style={{ width: '100%' }}>
				<Steps size="small" current={currentStep} items={stepsData} />

				{currentMilestone && (
					<Text type="secondary">
						<ClockCircleOutlined style={{ marginRight: 8, opacity: 0.6 }} />
						<span style={{ color: '#1890ff' }}>
							{currentMilestone.title} submission due on {currentMilestone.date}
						</span>
					</Text>
				)}
			</Space>
		</Card>
	);
}
