'use client';

import { CheckSquareOutlined } from '@ant-design/icons';
import { Card, Space, Timeline, Tooltip, Typography } from 'antd';
import { useRouter } from 'next/navigation';

import { FullMockGroup } from '@/data/group';

interface Props {
	group: FullMockGroup | null;
}

export default function ProjectMilestonesCard({ group }: Readonly<Props>) {
	const router = useRouter();
	const milestones = group?.milestones ?? [];

	const handleClick = () => {
		if (group) {
			router.push('/student/milestones');
		}
	};

	return (
		<Card
			hoverable
			onClick={handleClick}
			style={{ height: '100%', cursor: group ? 'pointer' : 'default' }}
			title={
				<Tooltip title={group ? 'Click to view details' : ''}>
					<Space align="center">
						<CheckSquareOutlined style={{ color: '#1890ff' }} />
						<Typography.Text strong style={{ fontSize: 16, color: '#1890ff' }}>
							Project Milestones
						</Typography.Text>
					</Space>
				</Tooltip>
			}
		>
			<Timeline mode="left">
				{milestones.map((item) => {
					let color: 'green' | 'blue' | 'gray' = 'gray';
					if (item.includes('Completed')) color = 'green';
					else if (item.includes('In Progress')) color = 'blue';

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
