'use client';

import { TeamOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Space, Typography } from 'antd';

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
				<Space direction="vertical">
					<Typography.Text strong>Group Name:</Typography.Text>
					<Typography.Text>{group.name}</Typography.Text>

					<Typography.Text strong>Thesis:</Typography.Text>
					<Typography.Text>{group.title}</Typography.Text>

					<Typography.Text strong>Supervisor:</Typography.Text>
					<Typography.Text>
						{group.supervisors.join(', ') ?? 'Unassigned'}
					</Typography.Text>

					<Typography.Text strong>Members:</Typography.Text>
					<Avatar.Group>
						{group.members.slice(0, 4).map((member) => (
							<Avatar key={member} icon={<UserOutlined />} alt={member} />
						))}
						{group.members.length > 4 && (
							<Avatar>+{group.members.length - 4}</Avatar>
						)}
					</Avatar.Group>
				</Space>
			) : (
				<Button type="primary">Join or Create a Group</Button>
			)}
		</Card>
	);
}
