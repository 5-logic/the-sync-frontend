'use client';

import { CheckSquareOutlined } from '@ant-design/icons';
import { Card, Timeline } from 'antd';

import { FullMockGroup } from '@/data/group';

interface Props {
	group: FullMockGroup | null;
}

export default function ProjectMilestonesCard({ group }: Props) {
	const milestones = group?.milestones ?? [];

	return (
		<Card
			style={{ height: '100%' }}
			title={
				<>
					<CheckSquareOutlined /> Project Milestones
				</>
			}
		>
			<Timeline mode="left">
				{milestones.map((item, idx) => (
					<Timeline.Item
						key={idx}
						color={
							item.includes('Completed')
								? 'green'
								: item.includes('In Progress')
									? 'blue'
									: 'gray'
						}
					>
						{item}
					</Timeline.Item>
				))}
			</Timeline>
		</Card>
	);
}
