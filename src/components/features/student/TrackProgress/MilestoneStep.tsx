'use client';

import { ClockCircleOutlined } from '@ant-design/icons';
import { Card, Space, Steps } from 'antd';

import { mockMilestoneDetails } from '@/data/milestone';

export default function MilestoneStep() {
	const currentStep = mockMilestoneDetails.findIndex(
		(m) => m.status === 'In Progress',
	);

	const stepsData = mockMilestoneDetails.map((milestone) => {
		let stepStatus: 'finish' | 'process' | 'wait';

		if (milestone.status === 'Ended') stepStatus = 'finish';
		else if (milestone.status === 'In Progress') stepStatus = 'process';
		else stepStatus = 'wait';

		return {
			title: milestone.title,
			status: stepStatus,
		};
	});

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
							display: 'flex',
							alignItems: 'center',
							width: '100%',
						}}
					>
						<ClockCircleOutlined
							style={{ marginRight: 8, color: 'black', opacity: 0.8 }}
						/>
						<span style={{ color: 'black' }}>
							{currentMilestone.title} submission due on {currentMilestone.date}
						</span>
					</div>
				)}
			</Space>
		</Card>
	);
}
