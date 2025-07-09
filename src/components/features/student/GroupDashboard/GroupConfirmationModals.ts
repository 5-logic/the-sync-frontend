import { ConfirmationModal } from '@/components/common/ConfirmModal';

// Group-specific confirmation modals
export const GroupConfirmationModals = {
	leaveGroup: (
		groupName: string,
		canLeave: boolean,
		isLeader: boolean,
		isOnlyMember: boolean,
		canModifyGroup: boolean,
		onConfirm: () => void | Promise<void>,
		loading = false,
	) => {
		// Determine message and note based on business rules
		let message = 'Are you sure you want to leave this group?';
		let note = 'You will no longer be a member of this group.';
		let noteType: 'info' | 'warning' | 'danger' = 'warning';

		if (!canModifyGroup) {
			message = 'Cannot leave group at this time.';
			note =
				'Group modifications are only allowed during PREPARING semester status.';
			noteType = 'danger';
		} else if (isLeader && !isOnlyMember) {
			message = 'Cannot leave group as leader.';
			note =
				'As a leader, you must transfer leadership to another member before leaving the group.';
			noteType = 'danger';
		} else if (isOnlyMember) {
			message = 'Cannot leave group as the only member.';
			note = 'Please delete the group instead if you want to leave.';
			noteType = 'danger';
		}

		return ConfirmationModal.show({
			title: 'Leave Group',
			message,
			details: `Group: ${groupName}`,
			note,
			noteType,
			okText: canLeave ? 'Yes, Leave' : 'OK',
			okType: canLeave ? 'danger' : 'default',
			loading,
			onOk: canLeave ? onConfirm : () => {},
			...(canLeave && { cancelText: 'Cancel' }),
		});
	},

	deleteGroup: (
		groupName: string,
		canDelete: boolean,
		hasThesisOrSubmissions: boolean,
		canModifyGroup: boolean,
		onConfirm: () => void | Promise<void>,
		loading = false,
	) => {
		// Determine message and note based on business rules
		let message = 'Are you sure you want to delete this group?';
		let note =
			'This action cannot be undone. All members will be notified via email about the group deletion.';
		const noteType: 'info' | 'warning' | 'danger' = 'danger';

		if (!canModifyGroup) {
			message = 'Cannot delete group at this time.';
			note =
				'Group modifications are only allowed during PREPARING semester status.';
		} else if (hasThesisOrSubmissions) {
			message = 'Cannot delete group with assigned thesis or submissions.';
			note =
				'Groups with assigned thesis, submitted work, or milestone submissions cannot be deleted.';
		}

		return ConfirmationModal.show({
			title: 'Delete Group',
			message,
			details: `Group: ${groupName}`,
			note,
			noteType,
			okText: canDelete ? 'Yes, Delete' : 'OK',
			okType: canDelete ? 'danger' : 'default',
			loading,
			onOk: canDelete ? onConfirm : () => {},
			...(canDelete && { cancelText: 'Cancel' }),
		});
	},

	transferLeadership: (
		groupName: string,
		newLeaderName: string,
		onConfirm: () => void | Promise<void>,
		loading = false,
	) => {
		return ConfirmationModal.show({
			title: 'Transfer Leadership',
			message: 'Are you sure you want to transfer group leadership?',
			details: `Group: ${groupName}`,
			note: `Leadership will be transferred to ${newLeaderName}. You will become a regular member of the group.`,
			noteType: 'info',
			okText: 'Yes, Transfer',
			loading,
			onOk: onConfirm,
		});
	},
};
