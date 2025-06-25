'use client';

import { Button, Card, Progress, Timeline, Typography } from 'antd';

import type { FullMockGroup } from '@/data/group';

const { Text } = Typography;

interface Props {
	group: FullMockGroup;
}

export default function ProgressOverviewCard({ group }: Props) {
	return (
		<Card
			title="Progress Overview"
			style={{
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
			}}
		>
			<div>
				<Text type="warning">{group.milestoneAlert}</Text>
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						marginTop: 8,
					}}
				>
					<Text strong>Overall Progress</Text>
					<Text type="secondary">{group.progress}%</Text>
				</div>
				<Progress
					percent={group.progress}
					showInfo={false}
					style={{ marginBottom: 16 }}
				/>

				<Timeline>
					{group.milestones.map((m, index) => {
						let color = 'gray';
						if (m.includes('Completed')) color = 'green';
						else if (m.includes('In Progress')) color = 'blue';
						return (
							<Timeline.Item key={index} color={color}>
								{m}
							</Timeline.Item>
						);
					})}
				</Timeline>
			</div>
			<Button type="primary" block style={{ marginTop: 16 }}>
				View Thesis Details
			</Button>
		</Card>
	);
}
