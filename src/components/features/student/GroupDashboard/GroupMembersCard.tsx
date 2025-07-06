import { TeamOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Card, Tag, Typography } from 'antd';

import { GroupDashboard } from '@/schemas/group';

const { Text } = Typography;

interface GroupMembersCardProps {
	group: GroupDashboard;
}

export default function GroupMembersCard({ group }: GroupMembersCardProps) {
	return (
		<Card
			title={
				<span>
					<TeamOutlined className="mr-2" />
					Members ({group.members.length})
				</span>
			}
			size="small"
		>
			<div className="space-y-3">
				{group.members.map((member) => (
					<div key={member.userId} className="flex items-center gap-3">
						<Avatar icon={<UserOutlined />} />
						<div className="flex-1">
							<div className="flex items-center gap-2">
								<Text strong>{member.user.fullName}</Text>
								{member.isLeader && <Tag color="gold">Leader</Tag>}
							</div>
							<Text type="secondary" className="text-sm">
								{member.studentCode} • {member.major.name}
							</Text>
						</div>
					</div>
				))}
			</div>
		</Card>
	);
}
