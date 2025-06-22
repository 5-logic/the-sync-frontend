'use client';

import { Card, Typography } from 'antd';

const { Title, Text } = Typography;

export default function ProjectMilestones() {
	return (
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
	);
}
