import { Button, Modal, Typography } from 'antd';
import { useState } from 'react';

import InviteTeamMembers from '@/components/features/student/FormOrJoinGroup/InviteTeamMembers';
import requestService from '@/lib/services/requests.service';
import { showNotification } from '@/lib/utils/notification';
import { GroupDashboard } from '@/schemas/group';
import type { Student } from '@/schemas/student';
import { useRequestsStore } from '@/store';

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
	const { fetchGroupRequests } = useRequestsStore();

	// Get existing member IDs to exclude from invites
	const existingMemberIds = group.members.map((member) => member.userId);

	const handleSendInvites = async () => {
		if (selectedMembers.length === 0) {
			showNotification.warning('Please select at least one student to invite.');
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
				console.log('Invite successful, refreshing requests...');
				showNotification.success(
					`Successfully sent ${selectedMembers.length} invitation(s)!`,
				);
				setSelectedMembers([]);

				// Refresh requests to update badge and table
				await fetchGroupRequests(groupId, true);
				console.log('Requests refreshed after invite');

				onSuccess();
			} else {
				showNotification.error('Failed to send invitations. Please try again.');
			}
		} catch (error) {
			console.error('Error sending invitations:', error);
			showNotification.error('Failed to send invitations. Please try again.');
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
			</div>

			<InviteTeamMembers
				members={selectedMembers}
				onMembersChange={setSelectedMembers}
				excludeUserIds={existingMemberIds}
				currentMemberCount={group.members.length}
			/>
		</Modal>
	);
}
