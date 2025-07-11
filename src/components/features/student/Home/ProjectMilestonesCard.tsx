'use client';

import { CheckSquareOutlined } from '@ant-design/icons';
import { Card, Timeline } from 'antd';

import { FullMockGroup } from '@/data/group';

interface Props {
	group: FullMockGroup | null;
}

export default function ProjectMilestonesCard({ group }: Readonly<Props>) {
	const milestones = group?.milestones ?? [];

	return (
		<Card
			style={{ height: '100%' }}
			hoverable
			title={
				<>
					<CheckSquareOutlined /> Project Milestones
				</>
			}
		>
			<Timeline mode="left">
				{milestones.map((item) => {
					let color: 'green' | 'blue' | 'gray' = 'gray';
					if (item.includes('Completed')) {
						color = 'green';
					} else if (item.includes('In Progress')) {
						color = 'blue';
					}

					return (
						<Timeline.Item key={item} color={color}>
							{item}
						</Timeline.Item>
					);
				})}
			</Timeline>
		</Card>
	);
}
