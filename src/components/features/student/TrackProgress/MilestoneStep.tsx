'use client';

import { ClockCircleOutlined } from '@ant-design/icons';
import { Card, Space, Steps } from 'antd';

import { mockMilestoneDetails } from '@/data/milestone';

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
					<div
						style={{
							border: '1px solid #91d5ff',
							backgroundColor: '#e6f7ff',
							borderRadius: 8,
							padding: '8px 12px',
							display: 'flex', // full width container
							alignItems: 'center',
							width: '100%', // stretch full width
						}}
					>
						<ClockCircleOutlined
							style={{ marginRight: 8, color: '#1890ff', opacity: 0.8 }}
						/>
						<span style={{ color: '#1890ff' }}>
							{currentMilestone.title} submission due on {currentMilestone.date}
						</span>
					</div>
				)}
			</Space>
		</Card>
	);
}
