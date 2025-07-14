import {
	CrownOutlined,
	DeleteOutlined,
	EyeOutlined,
	MoreOutlined,
	TeamOutlined,
	UserOutlined,
} from '@ant-design/icons';
import {
	Avatar,
	Button,
	Card,
	Dropdown,
	Modal,
	Popconfirm,
	Tag,
	Typography,
} from 'antd';
import type { MenuProps } from 'antd';
import { useState } from 'react';

import { GroupConfirmationModals } from '@/components/common/ConfirmModal';
import StudentInfoCard from '@/components/features/student/StudentInfoCard';
import { useSessionData } from '@/hooks/auth/useAuth';
import { useStudentProfile } from '@/hooks/student/useStudentProfile';
import groupService from '@/lib/services/groups.service';
import { showNotification } from '@/lib/utils/notification';
import { GroupDashboard, GroupMember } from '@/schemas/group';
import { useGroupDashboardStore } from '@/store/useGroupDashboardStore';

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
	const { refreshGroup } = useGroupDashboardStore();

	// State for member profile dialog
	const [selectedMember, setSelectedMember] = useState<GroupMember | null>(
		null,
	);
	const [profileDialogOpen, setProfileDialogOpen] = useState(false);

	// Fetch selected member's profile data
	const { data: memberProfile, loading: profileLoading } = useStudentProfile(
		selectedMember?.userId || '',
	);

	// Handle member actions (remove member, assign as leader)
	const handleMemberAction = async (key: string, member: GroupMember) => {
		if (!group || !member) return;

		if (key === 'view-profile') {
			// Open profile dialog for the selected member
			setSelectedMember(member);
			setProfileDialogOpen(true);
			return;
		}

		try {
			if (key === 'remove-member') {
				GroupConfirmationModals.removeMember(member.user.fullName, async () => {
					try {
						const response = await groupService.removeMember(
							group.id,
							member.userId,
						);
						if (response.success) {
							showNotification.success(
								'Success',
								`${member.user.fullName} has been removed from the group.`,
							);
							await refreshGroup();
						} else {
							showNotification.error(
								'Error',
								response.error || 'Failed to remove member.',
							);
						}
					} catch (error) {
						console.error('Error removing member:', error);
						showNotification.error(
							'Error',
							'An unexpected error occurred while removing the member.',
						);
					}
				});
			}

			if (key === 'assign-leader') {
				GroupConfirmationModals.assignLeader(member.user.fullName, async () => {
					try {
						const response = await groupService.changeLeader(
							group.id,
							member.userId,
						);
						if (response.success) {
							showNotification.success(
								'Success',
								`${member.user.fullName} is now the leader of the group.`,
							);
							await refreshGroup();
						} else {
							showNotification.error(
								'Error',
								response.error || 'Failed to change leader.',
							);
						}
					} catch (error) {
						console.error('Error changing leader:', error);
						showNotification.error(
							'Error',
							'An unexpected error occurred while changing the leader.',
						);
					}
				});
			}
		} catch (error) {
			console.error('Error handling member action:', error);
			showNotification.error('Error', 'An unexpected error occurred.');
		}
	};

	// Function to get menu items for each member
	const getMemberMenuItems = (
		member: GroupMember,
		isCurrentUserLeader: boolean,
	): MenuProps['items'] => {
		const items: MenuProps['items'] = [
			{
				key: 'view-profile',
				label: 'View Profile',
				icon: <EyeOutlined />,
				onClick: () => handleMemberAction('view-profile', member),
			},
		];

		// In viewOnly mode, only show "View Profile" option
		if (viewOnly) {
			return items;
		}

		// Add leader-only options if current user is leader and target is not the leader
		if (isCurrentUserLeader && !member.isLeader) {
			items.push(
				{
					key: 'remove-member',
					label: <span className="text-red-600">Remove Member</span>,
					icon: <DeleteOutlined className="text-red-600" />,
					onClick: () => handleMemberAction('remove-member', member),
				},
				{
					key: 'assign-leader',
					label: 'Assign as Leader',
					icon: <CrownOutlined />,
					onClick: () => handleMemberAction('assign-leader', member),
				},
			);
		}

		return items;
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
							{/* Only show dropdown if it's not the current user */}
							{session?.user?.id !== member.userId && (
								<Dropdown
									menu={{
										items: menuItems,
									}}
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
							)}
						</div>
					);
				})}
			</div>
			{/* Member Profile Dialog */}
			<Modal
				title="Student Information"
				open={profileDialogOpen}
				onCancel={() => {
					setProfileDialogOpen(false);
					setSelectedMember(null);
				}}
				footer={null}
				width={800}
				style={{ top: 20 }}
			>
				{memberProfile ? (
					<div className="mt-4">
						<StudentInfoCard student={memberProfile} loading={profileLoading} />

						{/* Action buttons for leaders */}
						{!viewOnly &&
							session?.user?.id === group.leader.userId &&
							selectedMember &&
							!selectedMember.isLeader && (
								<div className="mt-6 flex gap-3 justify-end border-t pt-4">
									<Popconfirm
										title="Remove Member"
										description={`Are you sure you want to remove ${selectedMember.user.fullName} from the group?`}
										onConfirm={() => {
											handleMemberAction('remove-member', selectedMember);
											setProfileDialogOpen(false);
										}}
										okText="Yes, Remove"
										cancelText="Cancel"
										okButtonProps={{ danger: true }}
									>
										<Button danger icon={<DeleteOutlined />}>
											Remove from Group
										</Button>
									</Popconfirm>

									<Popconfirm
										title="Assign as Leader"
										description={`Are you sure you want to make ${selectedMember.user.fullName} the leader of this group?`}
										onConfirm={() => {
											handleMemberAction('assign-leader', selectedMember);
											setProfileDialogOpen(false);
										}}
										okText="Yes, Assign"
										cancelText="Cancel"
									>
										<Button type="primary" icon={<CrownOutlined />}>
											Assign as Leader
										</Button>
									</Popconfirm>
								</div>
							)}
					</div>
				) : (
					<div className="mt-4">
						<StudentInfoCard student={null} loading={profileLoading} />
					</div>
				)}
			</Modal>
		</Card>
	);
}
