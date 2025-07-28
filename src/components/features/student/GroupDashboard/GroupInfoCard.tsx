import { ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Divider, Space, Spin, Tag, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import { memo, useEffect, useState } from 'react';

import EditGroupInfoDialog from '@/components/features/student/GroupDashboard/EditGroupInfoDialog';
import { GroupConfirmationModals } from '@/components/features/student/GroupDashboard/GroupConfirmationModals';
import GroupMembersCard from '@/components/features/student/GroupDashboard/GroupMembersCard';
import InviteMembersDialog from '@/components/features/student/GroupDashboard/InviteMembersDialog';
import { useSessionData } from '@/hooks/auth/useAuth';
import { GROUP_MAX_MEMBERS } from '@/lib/constants/group';
import groupService from '@/lib/services/groups.service';
import { formatDate } from '@/lib/utils/dateFormat';
import { showNotification } from '@/lib/utils/notification';
import { GroupDashboard } from '@/schemas/group';
import { useRequestsStore } from '@/store';
import { useGroupDashboardStore } from '@/store/useGroupDashboardStore';

const { Title, Text } = Typography;

interface GroupInfoCardProps {
	readonly group: GroupDashboard;
	readonly viewOnly?: boolean;
}

export default memo(function GroupInfoCard({
	group,
	viewOnly = false,
}: GroupInfoCardProps) {
	const [isInviteDialogVisible, setIsInviteDialogVisible] = useState(false);
	const [isEditDialogVisible, setIsEditDialogVisible] = useState(false);
	const [isLeaving, setIsLeaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [localGroup, setLocalGroup] = useState<GroupDashboard>(group);
	const { session } = useSessionData();
	const { clearGroup } = useGroupDashboardStore();
	const { fetchGroupRequests } = useRequestsStore();
	const router = useRouter();

	// Sync local state with prop changes
	useEffect(() => {
		setLocalGroup(group);
	}, [group]);

	const handleInviteSuccess = () => {
		setIsInviteDialogVisible(false);
		// Refresh group data to reflect any changes
		handleRefreshGroup();
	};

	const handleRefreshGroup = async () => {
		setIsRefreshing(true);
		try {
			// Fetch fresh group data directly without updating global store
			const response = await groupService.getStudentGroup();
			if (response.success && response.data.length > 0) {
				// Update local component state with fresh data
				setLocalGroup(response.data[0]);
			}

			// Also refresh requests to get latest request data
			await fetchGroupRequests(localGroup.id, true);
		} catch {
			showNotification.error(
				'Refresh Failed',
				'Failed to refresh group information. Please try again.',
			);
		} finally {
			setIsRefreshing(false);
		}
	};

	// Check if current user is the leader
	const isCurrentUserLeader = session?.user?.id === localGroup.leader.userId;

	// Check if group has reached maximum members
	const hasReachedMaxMembers = localGroup.members.length >= GROUP_MAX_MEMBERS;

	// Check if group has thesis or submissions (cannot delete)
	const hasThesisOrSubmissions = localGroup.thesis !== null;

	// Check if semester is in PREPARING status and group doesn't have thesis
	const canModifyGroup =
		localGroup.semester.status === 'Preparing' && !hasThesisOrSubmissions;

	// Check if semester is in PREPARING status (can leave group and invite members even with thesis)
	const canLeaveOrInvite = localGroup.semester.status === 'Preparing';

	// Check if semester is NOT in PREPARING status - hide action buttons
	const shouldHideActionButtons = localGroup.semester.status !== 'Preparing';

	// Check if user is the only member (cannot leave - must delete instead)
	const isOnlyMember = localGroup.members.length === 1;

	// Helper function to get Leave Group button title
	const getLeaveGroupButtonTitle = () => {
		if (!canLeaveOrInvite) {
			return 'Cannot leave group during this semester status';
		}
		if (isCurrentUserLeader && localGroup.members.length > 1) {
			return 'Transfer leadership before leaving';
		}
		if (isOnlyMember) {
			return 'Cannot leave as the only member';
		}
		return 'Leave this group';
	};

	// Helper function to get Delete Group button title
	const getDeleteGroupButtonTitle = () => {
		// Check thesis/submissions first (more specific reason)
		if (hasThesisOrSubmissions) {
			return 'Cannot delete group with thesis or submissions';
		}
		// Then check semester status
		if (localGroup.semester.status !== 'Preparing') {
			return 'Cannot delete group during this semester status';
		}
		return 'Delete this group permanently';
	};

	const handleLeaveGroup = async () => {
		if (!canLeaveOrInvite) {
			showNotification.error(
				'Cannot Leave Group',
				'Cannot leave group. Semester is not in PREPARING status.',
			);
			return;
		}

		if (isCurrentUserLeader && localGroup.members.length > 1) {
			showNotification.error(
				'Transfer Leadership Required',
				'As a leader, you must transfer leadership to another member before leaving the group.',
			);
			return;
		}

		if (isOnlyMember) {
			showNotification.error(
				'Cannot Leave Group',
				'Cannot leave group as the only member. Please delete the group instead.',
			);
			return;
		}

		setIsLeaving(true);
		try {
			await groupService.leaveGroup(localGroup.id);
			showNotification.success('Success', 'Successfully left the group!');
			// Clear group data from store
			clearGroup();
			// Navigate to form or join group page since user no longer has a group
			router.push('/student/form-or-join-group');
		} catch {
			showNotification.error(
				'Error',
				'Failed to leave group. Please try again.',
			);
		} finally {
			setIsLeaving(false);
		}
	};

	const handleDeleteGroup = async () => {
		// Check thesis/submissions first (more specific reason)
		if (hasThesisOrSubmissions) {
			showNotification.error(
				'Cannot Delete Group',
				'Cannot delete group that has assigned thesis or submissions.',
			);
			return;
		}

		// Then check semester status
		if (localGroup.semester.status !== 'Preparing') {
			showNotification.error(
				'Cannot Delete Group',
				'Cannot delete group. Semester is not in PREPARING status.',
			);
			return;
		}

		setIsDeleting(true);
		try {
			await groupService.deleteGroup(localGroup.id);
			showNotification.success('Success', 'Group deleted successfully!');
			// Clear group data from store
			clearGroup();
			// Navigate to form or join group page since group no longer exists
			router.push('/student/form-or-join-group');
		} catch {
			showNotification.error(
				'Error',
				'Failed to delete group. Please try again.',
			);
		} finally {
			setIsDeleting(false);
		}
	};

	// Helper function to get Invite Members button title
	const getInviteMembersButtonTitle = () => {
		if (!canLeaveOrInvite) {
			return 'Cannot invite members during this semester status';
		}
		if (hasReachedMaxMembers) {
			return `Cannot invite more members. Maximum ${GROUP_MAX_MEMBERS} members allowed.`;
		}
		return 'Invite new members to this group';
	};

	const showLeaveGroupConfirm = () => {
		const canLeave =
			canLeaveOrInvite &&
			!(isCurrentUserLeader && localGroup.members.length > 1) &&
			!isOnlyMember;

		GroupConfirmationModals.leaveGroup(
			localGroup.name,
			canLeave,
			isCurrentUserLeader,
			isOnlyMember,
			canLeaveOrInvite,
			handleLeaveGroup,
			isLeaving,
		);
	};

	const showDeleteGroupConfirm = () => {
		const canDelete = canModifyGroup && !hasThesisOrSubmissions;

		GroupConfirmationModals.deleteGroup(
			localGroup.name,
			canDelete,
			hasThesisOrSubmissions,
			canModifyGroup,
			handleDeleteGroup,
			isDeleting,
		);
	};

	return (
		<Spin spinning={isRefreshing} tip="Refreshing group information...">
			<Card className="bg-white border border-gray-200 rounded-md">
				<div className="pb-4">
					<div className="flex justify-between items-center">
						<Title level={4} className="text-base font-bold text-gray-600 mb-3">
							Group Information
						</Title>
						<div className="flex gap-2">
							{/* Refresh Button - always visible when not in viewOnly mode */}
							{!viewOnly && (
								<Button
									icon={<ReloadOutlined />}
									onClick={handleRefreshGroup}
									loading={isRefreshing}
									title="Refresh group information"
								/>
							)}
							{/* Edit Group Info Button - only visible to leader and when can modify */}
							{!viewOnly && isCurrentUserLeader && canModifyGroup && (
								<Button
									type="primary"
									onClick={() => setIsEditDialogVisible(true)}
									title="Edit group information"
								>
									Edit Group Info
								</Button>
							)}
						</div>
					</div>
					<Divider className="bg-gray-100 my-3" size="small" />
				</div>

				<div className="space-y-4">
					{/* Group Details */}
					<div className="space-y-4">
						{/* Basic Group Info */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<Text className="text-sm text-gray-400 block font-semibold">
									Group Name
								</Text>
								<Text className="text-sm text-gray-600">{localGroup.name}</Text>
							</div>
							<div>
								<Text className="text-sm text-gray-400 block font-semibold">
									Group Code
								</Text>
								<Text className="text-sm text-gray-600">{localGroup.code}</Text>
							</div>
							<div>
								<Text className="text-sm text-gray-400 block font-semibold">
									Semester
								</Text>
								<Text className="text-sm text-gray-600">
									{localGroup.semester.name}
								</Text>
							</div>
						</div>

						{/* Project Direction */}
						<div>
							<Text className="text-sm text-gray-400 block font-semibold">
								Project Direction
							</Text>
							<Text className="text-sm text-gray-600">
								{localGroup.projectDirection || (
									<span className="text-gray-400 italic">Not specified</span>
								)}
							</Text>
						</div>

						{/* Skills and Responsibilities - 2 columns */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{' '}
							{/* Required Skills */}
							<div>
								<Text className="text-sm text-gray-400 block font-semibold">
									Required Skills
								</Text>
								{localGroup.skills && localGroup.skills.length > 0 ? (
									<div className="flex flex-wrap gap-2 mt-1">
										{localGroup.skills.map((skill) => (
											<Tag key={skill.id} color="blue" className="text-xs">
												{skill.name}
											</Tag>
										))}
									</div>
								) : (
									<Text className="text-gray-400 italic">Not specified</Text>
								)}
							</div>
							{/* Responsibilities */}
							<div>
								<Text className="text-sm text-gray-400 block font-semibold">
									Expected Responsibilities
								</Text>
								{localGroup.responsibilities &&
								localGroup.responsibilities.length > 0 ? (
									<div className="flex flex-wrap gap-2 mt-1">
										{localGroup.responsibilities.map((responsibility) => (
											<Tag
												key={responsibility.id}
												color="green"
												className="text-xs"
											>
												{responsibility.name}
											</Tag>
										))}
									</div>
								) : (
									<Text className="text-gray-400 italic">Not specified</Text>
								)}
							</div>
						</div>

						{/* Members Section */}
						<div>
							<Text className="text-sm text-gray-400 block font-semibold">
								Members
							</Text>
						</div>
					</div>

					{/* Members Card */}
					<GroupMembersCard
						group={localGroup}
						viewOnly={viewOnly}
						onRefresh={handleRefreshGroup}
					/>

					{/* Created Date and Action Buttons */}
					<div
						className={`flex flex-col sm:flex-row sm:items-end ${viewOnly ? 'sm:justify-start' : 'sm:justify-between'} gap-4 pt-4`}
					>
						<div className="flex-shrink-0">
							<Text className="text-sm text-gray-400 block font-semibold">
								Created Date
							</Text>
							<Text className="text-sm text-gray-600 whitespace-nowrap">
								{formatDate(localGroup.createdAt)}
							</Text>
						</div>

						{/* Action buttons only shown when not in viewOnly mode and semester is Preparing */}
						{!viewOnly && !shouldHideActionButtons && (
							<Space>
								{/* Leave Group Button - visible to all members */}
								<Button
									danger
									loading={isLeaving}
									disabled={
										!canLeaveOrInvite ||
										(isCurrentUserLeader && localGroup.members.length > 1) ||
										isOnlyMember
									}
									onClick={showLeaveGroupConfirm}
									title={getLeaveGroupButtonTitle()}
								>
									Leave Group
								</Button>

								{/* Delete Group Button - only visible to leader */}
								{isCurrentUserLeader && (
									<Button
										danger
										loading={isDeleting}
										disabled={!canModifyGroup || hasThesisOrSubmissions}
										onClick={showDeleteGroupConfirm}
										title={getDeleteGroupButtonTitle()}
									>
										Delete Group
									</Button>
								)}

								{/* Invite Members Button - only visible to leader */}
								{isCurrentUserLeader && (
									<Button
										type="primary"
										onClick={() => setIsInviteDialogVisible(true)}
										disabled={!canLeaveOrInvite || hasReachedMaxMembers}
										title={getInviteMembersButtonTitle()}
									>
										Invite Members
									</Button>
								)}
							</Space>
						)}
					</div>
				</div>

				{/* Invite dialog only shown when not in viewOnly mode */}
				{!viewOnly && (
					<InviteMembersDialog
						visible={isInviteDialogVisible}
						onCancel={() => setIsInviteDialogVisible(false)}
						onSuccess={handleInviteSuccess}
						groupId={localGroup.id}
						group={localGroup}
					/>
				)}

				{/* Edit Group Info dialog only shown when not in viewOnly mode */}
				{!viewOnly && (
					<EditGroupInfoDialog
						visible={isEditDialogVisible}
						onCancel={() => setIsEditDialogVisible(false)}
						onSuccess={() => {
							setIsEditDialogVisible(false);
							// Update local state with fresh data after successful edit
							handleRefreshGroup();
						}}
						group={localGroup}
					/>
				)}
			</Card>
		</Spin>
	);
});
