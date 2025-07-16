import { Button, Card, Divider, Space, Tag, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import { memo, useState } from 'react';

import { GroupConfirmationModals } from '@/components/features/student/GroupDashboard/GroupConfirmationModals';
import GroupMembersCard from '@/components/features/student/GroupDashboard/GroupMembersCard';
import InviteMembersDialog from '@/components/features/student/GroupDashboard/InviteMembersDialog';
import { useSessionData } from '@/hooks/auth/useAuth';
import groupService from '@/lib/services/groups.service';
import { formatDate } from '@/lib/utils/dateFormat';
import { showNotification } from '@/lib/utils/notification';
import { GroupDashboard } from '@/schemas/group';
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
	const [isLeaving, setIsLeaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const { session } = useSessionData();
	const { refreshGroup, clearGroup } = useGroupDashboardStore();
	const router = useRouter();

	const handleInviteSuccess = () => {
		setIsInviteDialogVisible(false);
		// Refresh group data to reflect any changes
		refreshGroup();
	};

	// Check if current user is the leader
	const isCurrentUserLeader = session?.user?.id === group.leader.userId;

	// Check if group has thesis or submissions (cannot delete)
	const hasThesisOrSubmissions = group.thesis !== null;

	// Check if semester is in PREPARING status and group doesn't have thesis
	const canModifyGroup =
		group.semester.status === 'Preparing' && !hasThesisOrSubmissions;

	// Check if semester is NOT in PREPARING status - hide action buttons
	const shouldHideActionButtons = group.semester.status !== 'Preparing';

	// Check if user is the only member (cannot leave - must delete instead)
	const isOnlyMember = group.members.length === 1;

	// Helper function to get Leave Group button title
	const getLeaveGroupButtonTitle = () => {
		if (!canModifyGroup) {
			return 'Cannot leave group during this semester status';
		}
		if (isCurrentUserLeader && group.members.length > 1) {
			return 'Transfer leadership before leaving';
		}
		if (isOnlyMember) {
			return 'Cannot leave as the only member';
		}
		return 'Leave this group';
	};

	// Helper function to get Delete Group button title
	const getDeleteGroupButtonTitle = () => {
		if (!canModifyGroup) {
			return 'Cannot delete group during this semester status';
		}
		if (hasThesisOrSubmissions) {
			return 'Cannot delete group with thesis or submissions';
		}
		return 'Delete this group permanently';
	};

	const handleLeaveGroup = async () => {
		if (!canModifyGroup) {
			showNotification.error(
				'Cannot leave group. Semester is not in PREPARING status.',
			);
			return;
		}

		if (isCurrentUserLeader && group.members.length > 1) {
			showNotification.error(
				'As a leader, you must transfer leadership to another member before leaving the group.',
			);
			return;
		}

		if (isOnlyMember) {
			showNotification.error(
				'Cannot leave group as the only member. Please delete the group instead.',
			);
			return;
		}

		setIsLeaving(true);
		try {
			await groupService.leaveGroup(group.id);
			showNotification.success('Successfully left the group!');
			// Clear group data from store
			clearGroup();
			// Navigate to form or join group page since user no longer has a group
			router.push('/student/form-or-join-group');
		} catch {
			showNotification.error('Failed to leave group. Please try again.');
		} finally {
			setIsLeaving(false);
		}
	};

	const handleDeleteGroup = async () => {
		if (!canModifyGroup) {
			showNotification.error(
				'Cannot delete group. Semester is not in PREPARING status.',
			);
			return;
		}

		if (hasThesisOrSubmissions) {
			showNotification.error(
				'Cannot delete group that has assigned thesis or submissions.',
			);
			return;
		}

		setIsDeleting(true);
		try {
			await groupService.deleteGroup(group.id);
			showNotification.success('Group deleted successfully!');
			// Clear group data from store
			clearGroup();
			// Navigate to form or join group page since group no longer exists
			router.push('/student/form-or-join-group');
		} catch {
			showNotification.error('Failed to delete group. Please try again.');
		} finally {
			setIsDeleting(false);
		}
	};

	const showLeaveGroupConfirm = () => {
		const canLeave =
			canModifyGroup &&
			!(isCurrentUserLeader && group.members.length > 1) &&
			!isOnlyMember;

		GroupConfirmationModals.leaveGroup(
			group.name,
			canLeave,
			isCurrentUserLeader,
			isOnlyMember,
			canModifyGroup,
			handleLeaveGroup,
			isLeaving,
		);
	};

	const showDeleteGroupConfirm = () => {
		const canDelete = canModifyGroup && !hasThesisOrSubmissions;

		GroupConfirmationModals.deleteGroup(
			group.name,
			canDelete,
			hasThesisOrSubmissions,
			canModifyGroup,
			handleDeleteGroup,
			isDeleting,
		);
	};

	return (
		<Card className="bg-white border border-gray-200 rounded-md">
			<div className="pb-4">
				<Title level={4} className="text-base font-bold text-gray-600 mb-3">
					Group Information
				</Title>
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
							<Text className="text-sm text-gray-600">{group.name}</Text>
						</div>
						<div>
							<Text className="text-sm text-gray-400 block font-semibold">
								Group Code
							</Text>
							<Text className="text-sm text-gray-600">{group.code}</Text>
						</div>
						<div>
							<Text className="text-sm text-gray-400 block font-semibold">
								Semester
							</Text>
							<Text className="text-sm text-gray-600">
								{group.semester.name}
							</Text>
						</div>
					</div>

					{/* Project Direction */}
					{group.projectDirection && (
						<div>
							<Text className="text-sm text-gray-400 block font-semibold">
								Project Direction
							</Text>
							<Text className="text-sm text-gray-600">
								{group.projectDirection}
							</Text>
						</div>
					)}

					{/* Skills and Responsibilities - 2 columns */}
					{((group.skills && group.skills.length > 0) ||
						(group.responsibilities && group.responsibilities.length > 0)) && (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* Required Skills */}
							{group.skills && group.skills.length > 0 && (
								<div>
									<Text className="text-sm text-gray-400 block font-semibold">
										Required Skills
									</Text>
									<div className="flex flex-wrap gap-2 mt-1">
										{group.skills.map((skill) => (
											<Tag key={skill.id} color="blue" className="text-xs">
												{skill.name}
											</Tag>
										))}
									</div>
								</div>
							)}

							{/* Responsibilities */}
							{group.responsibilities && group.responsibilities.length > 0 && (
								<div>
									<Text className="text-sm text-gray-400 block font-semibold">
										Responsibilities
									</Text>
									<div className="flex flex-wrap gap-2 mt-1">
										{group.responsibilities.map((responsibility) => (
											<Tag
												key={responsibility.id}
												color="green"
												className="text-xs"
											>
												{responsibility.name}
											</Tag>
										))}
									</div>
								</div>
							)}
						</div>
					)}

					{/* Members Section */}
					<div>
						<Text className="text-sm text-gray-400 block font-semibold">
							Members
						</Text>
					</div>
				</div>

				{/* Members Card */}
				<GroupMembersCard group={group} viewOnly={viewOnly} />

				{/* Created Date and Action Buttons */}
				<div
					className={`flex flex-col sm:flex-row sm:items-end ${viewOnly ? 'sm:justify-start' : 'sm:justify-between'} gap-4 pt-4`}
				>
					<div className="flex-shrink-0">
						<Text className="text-sm text-gray-400 block font-semibold">
							Created Date
						</Text>
						<Text className="text-sm text-gray-600 whitespace-nowrap">
							{formatDate(group.createdAt)}
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
									!canModifyGroup ||
									(isCurrentUserLeader && group.members.length > 1) ||
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
									disabled={!canModifyGroup}
									title={
										!canModifyGroup
											? 'Cannot invite members during this semester status'
											: 'Invite new members to this group'
									}
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
					groupId={group.id}
					group={group}
				/>
			)}
		</Card>
	);
});
