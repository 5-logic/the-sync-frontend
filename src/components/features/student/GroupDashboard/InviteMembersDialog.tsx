import { Button, Modal, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import InviteTeamMembers from '@/components/features/student/FormOrJoinGroup/CreateGroup/InviteTeamMembers';
import requestService from '@/lib/services/requests.service';
import { showNotification } from '@/lib/utils/notification';
import { GroupDashboard } from '@/schemas/group';
import type { Student } from '@/schemas/student';
import { useRequestsStore, useStudentStore } from '@/store';

const { Text } = Typography;

interface InviteMembersDialogProps {
	readonly visible: boolean;
	readonly onCancel: () => void;
	readonly onSuccess: () => void;
	readonly groupId: string;
	readonly group: GroupDashboard; // Add group data to exclude existing members
}

export default function InviteMembersDialog({
	visible,
	onCancel,
	onSuccess,
	groupId,
	group,
}: InviteMembersDialogProps) {
	const [selectedMembers, setSelectedMembers] = useState<Student[]>([]);
	const [loading, setLoading] = useState(false);
	const { fetchGroupRequests, requests } = useRequestsStore();
	const { fetchStudentsWithoutGroupAuto } = useStudentStore();

	// Get existing member IDs to exclude from invites
	const existingMemberIds = group.members.map((member) => member.userId);

	// Helper function to get user IDs by request type and status
	const getUserIdsByRequestType = useMemo(() => {
		return (type: 'Join' | 'Invite') => {
			return requests
				.filter(
					(request) =>
						request.groupId === groupId &&
						request.type === type &&
						request.status === 'Pending',
				)
				.map((request) => request.student.userId);
		};
	}, [requests, groupId]);

	// Get user IDs who have pending join requests for this group
	const pendingJoinRequestUserIds = useMemo(() => {
		return getUserIdsByRequestType('Join');
	}, [getUserIdsByRequestType]);

	// Get user IDs who have pending invite requests from this group
	const pendingInviteRequestUserIds = useMemo(() => {
		return getUserIdsByRequestType('Invite');
	}, [getUserIdsByRequestType]);

	// Combine existing members, pending join requests, and pending invite requests to exclude
	const excludeUserIds = useMemo(() => {
		return [
			...existingMemberIds,
			...pendingJoinRequestUserIds,
			...pendingInviteRequestUserIds,
		];
	}, [
		existingMemberIds,
		pendingJoinRequestUserIds,
		pendingInviteRequestUserIds,
	]);

	// Fetch requests and students when dialog opens to ensure we have latest data
	useEffect(() => {
		if (visible) {
			fetchGroupRequests(groupId, true); // Force refresh to get latest requests
			fetchStudentsWithoutGroupAuto(); // Refresh students list to get latest data
		}
	}, [visible, groupId, fetchGroupRequests, fetchStudentsWithoutGroupAuto]);

	// Debug log in development mode
	useEffect(() => {
		if (process.env.NODE_ENV === 'development' && visible) {
			console.log('Exclude user IDs:', {
				existingMembers: existingMemberIds,
				pendingJoinRequests: pendingJoinRequestUserIds,
				pendingInviteRequests: pendingInviteRequestUserIds,
				total: excludeUserIds,
			});
		}
	}, [
		visible,
		existingMemberIds,
		pendingJoinRequestUserIds,
		pendingInviteRequestUserIds,
		excludeUserIds,
	]);

	const handleSendInvites = async () => {
		if (selectedMembers.length === 0) {
			showNotification.warning(
				'No Students Selected',
				'Please select at least one student to invite.',
			);
			return;
		}

		setLoading(true);
		try {
			const studentIds = selectedMembers.map((member) => member.id);
			const response = await requestService.inviteMultipleStudents(
				groupId,
				studentIds,
			);

			if (response.success) {
				showNotification.success(
					'Invitations Sent',
					`Successfully sent ${selectedMembers.length} invitation(s)!`,
				);
				setSelectedMembers([]);

				// Refresh requests to update badge and table
				await fetchGroupRequests(groupId, true);

				onSuccess();
			} else {
				showNotification.error(
					'Failed to Send Invitations',
					'Failed to send invitations. Please try again.',
				);
			}
		} catch (error) {
			console.error('Error sending invitations:', error);
			showNotification.error(
				'Failed to Send Invitations',
				'Failed to send invitations. Please try again.',
			);
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = () => {
		setSelectedMembers([]);
		onCancel();
	};

	return (
		<Modal
			title="Invite Members to Group"
			open={visible}
			onCancel={handleCancel}
			width={800}
			footer={[
				<Button key="cancel" onClick={handleCancel}>
					Cancel
				</Button>,
				<Button
					key="send"
					type="primary"
					loading={loading}
					onClick={handleSendInvites}
					disabled={selectedMembers.length === 0}
				>
					Send Invitation{selectedMembers.length > 1 ? 's' : ''} (
					{selectedMembers.length})
				</Button>,
			]}
		>
			<div className="mb-4">
				<Text type="secondary">
					Select students to invite to your group. They will receive an
					invitation request that they can accept or decline.
				</Text>
				{(pendingJoinRequestUserIds.length > 0 ||
					pendingInviteRequestUserIds.length > 0) && (
					<div className="mt-2">
						<Text type="secondary" className="text-xs">
							Note: Students with pending requests (join or invite) are
							automatically excluded from the list.
						</Text>
					</div>
				)}
			</div>

			<InviteTeamMembers
				members={selectedMembers}
				onMembersChange={setSelectedMembers}
				excludeUserIds={excludeUserIds}
				currentMemberCount={group.members.length}
			/>
		</Modal>
	);
}
