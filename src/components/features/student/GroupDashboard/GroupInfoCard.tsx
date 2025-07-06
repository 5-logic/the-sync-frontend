import { CalendarOutlined } from '@ant-design/icons';
import { Card, Tag, Typography } from 'antd';

import { GroupDashboard } from '@/schemas/group';

const { Title, Text } = Typography;

interface GroupInfoCardProps {
	group: GroupDashboard;
}

export default function GroupInfoCard({ group }: GroupInfoCardProps) {
	return (
		<Card>
			<div className="flex items-center justify-between">
				<div>
					<Title level={3} className="mb-2">
						{group.name}
					</Title>
					<Text type="secondary" className="text-lg">
						Group Code: <Text strong>{group.code}</Text>
					</Text>
				</div>
				<div className="text-right">
					<div className="flex items-center gap-2 mb-2">
						<CalendarOutlined />
						<Text>{group.semester.name}</Text>
						<Tag color="blue">{group.semester.status}</Tag>
					</div>
					<Text type="secondary">
						{group.participation.isLeader ? 'Leader' : 'Member'}
					</Text>
				</div>
			</div>
		</Card>
	);
}
