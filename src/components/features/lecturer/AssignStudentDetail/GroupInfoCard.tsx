'use client';

import { Card, Divider, Space, Typography } from 'antd';

import { formatDate } from '@/lib/utils/dateFormat';
import { GroupDashboard } from '@/schemas/group';

const { Title, Text } = Typography;

interface GroupInfoCardProps {
	readonly group: GroupDashboard;
}

export default function GroupInfoCard({ group }: GroupInfoCardProps) {
	return (
		<Card>
			<Space direction="vertical" size="small" style={{ width: '100%' }}>
				<div>
					<Title level={4} style={{ margin: 0 }}>
						{group.name}
					</Title>
					<Text type="secondary">{group.code}</Text>
				</div>

				<Divider style={{ margin: '12px 0' }} />

				<Space direction="vertical" size="small">
					<div>
						<Text strong>Project Direction: </Text>
						<Text>{group.projectDirection || 'Not specified'}</Text>
					</div>{' '}
					<div>
						<Text strong>Semester: </Text>
						<Text>
							{group.semester?.name} ({group.semester?.code})
						</Text>
					</div>
					<div>
						<Text strong>Leader: </Text>
						<Text>{group.leader?.user?.fullName || 'No leader assigned'}</Text>
					</div>
					<div>
						<Text strong>Members: </Text>
						<Text>{group.members?.length || 0} member(s)</Text>
					</div>
					{group.createdAt && (
						<div>
							<Text strong>Created: </Text>
							<Text type="secondary">
								{formatDate(new Date(group.createdAt))}
							</Text>
						</div>
					)}
				</Space>
			</Space>
		</Card>
	);
}
