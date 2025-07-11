'use client';

import { TeamOutlined } from '@ant-design/icons';
import { Button, Card, Space, Typography } from 'antd';

import { FullMockGroup } from '@/data/group';

interface Props {
	group: FullMockGroup | null;
}

export default function GroupInformationCard({ group }: Readonly<Props>) {
	return (
		<Card
			style={{ height: '100%' }}
			title={
				<>
					<TeamOutlined /> Group Information
				</>
			}
		>
			{group ? (
				<Space direction="vertical" size="small">
					<Typography.Text strong>Group Name:</Typography.Text>
					<Typography.Text>{group.name}</Typography.Text>

					<Typography.Text strong>Group Leader:</Typography.Text>
					<Typography.Text>{group.leader}</Typography.Text>

					<Typography.Text strong>Members:</Typography.Text>
					<Typography.Text>{group.members.length} members</Typography.Text>
				</Space>
			) : (
				<Button type="primary" block>
					Join or Create a Group
				</Button>
			)}
		</Card>
	);
}
