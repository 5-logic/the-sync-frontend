import {
	CrownOutlined,
	DeleteOutlined,
	EyeOutlined,
	MoreOutlined,
	TeamOutlined,
	UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Card, Dropdown, Tag, Typography } from 'antd';
import type { MenuProps } from 'antd';

import { useSessionData } from '@/hooks/auth/useAuth';
import { GroupDashboard, GroupMember } from '@/schemas/group';

const { Text } = Typography;

interface GroupMembersCardProps {
	readonly group: GroupDashboard;
	readonly viewOnly?: boolean;
}

export default function GroupMembersCard({
	group,
	viewOnly = false,
}: GroupMembersCardProps) {
	const { session } = useSessionData();

	// Function to get menu items for each member
	const getMemberMenuItems = (
		member: GroupMember,
		isCurrentUserLeader: boolean,
	): MenuProps['items'] => {
		const baseItems = [
			{
				key: 'view-profile',
				label: 'View Profile',
				icon: <EyeOutlined />,
			},
		];

		// In viewOnly mode, only show "View Profile" option
		if (viewOnly) {
			return baseItems;
		}

		// Add leader-only options if current user is leader and target is not the leader
		if (isCurrentUserLeader && !member.isLeader) {
			baseItems.push(
				{
					key: 'remove-member',
					label: 'Remove Member',
					icon: <DeleteOutlined />,
				},
				{
					key: 'assign-leader',
					label: 'Assign as Leader',
					icon: <CrownOutlined />,
				},
			);
		}

		return baseItems;
	};
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
			{' '}
			<div className="space-y-3">
				{group.members.map((member) => {
					// Check if the current user is the leader by comparing user IDs
					const isCurrentUserLeader = session?.user?.id === group.leader.userId;
					const menuItems = getMemberMenuItems(member, isCurrentUserLeader);

					return (
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
							<Dropdown
								menu={{ items: menuItems }}
								placement="bottomRight"
								trigger={['click']}
							>
								<Button
									type="text"
									size="small"
									icon={<MoreOutlined />}
									className="flex-shrink-0"
								/>
							</Dropdown>
						</div>
					);
				})}
			</div>
		</Card>
	);
}
