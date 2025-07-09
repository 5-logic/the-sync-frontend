import { Modal, Space, Typography } from 'antd';

export interface ConfirmationModalProps {
	title: string;
	message: string;
	details?: string;
	note?: string;
	noteType?: 'info' | 'warning' | 'danger';
	okText?: string;
	cancelText?: string;
	okType?: 'default' | 'primary' | 'danger';
	loading?: boolean;
	centered?: boolean;
	closeOnMaskClick?: boolean;
	onOk: () => void | Promise<void>;
	onCancel?: () => void;
}

export const ConfirmationModal = {
	show: (props: ConfirmationModalProps) => {
		const {
			title,
			message,
			details,
			note,
			noteType = 'info',
			okText = 'OK',
			cancelText = 'Cancel',
			okType = 'primary',
			loading = false,
			centered = true,
			closeOnMaskClick = true,
			onOk,
			onCancel,
		} = props;

		// Determine note color based on type
		const getNoteStyle = () => {
			switch (noteType) {
				case 'warning':
					return { color: '#faad14' };
				case 'danger':
					return { color: '#ff4d4f' };
				default:
					return {};
			}
		};

		// Determine note prefix based on type
		const getNotePrefix = () => {
			switch (noteType) {
				case 'warning':
				case 'danger':
					return 'Warning: ';
				default:
					return 'Note: ';
			}
		};

		Modal.confirm({
			title,
			content: (
				<Space direction="vertical" size="small">
					<Typography.Text>{message}</Typography.Text>
					{details && (
						<Typography.Text>
							<Typography.Text strong>Title:</Typography.Text> {details}
						</Typography.Text>
					)}
					{note && (
						<Typography.Text strong style={getNoteStyle()}>
							{getNotePrefix()}
							{note}
						</Typography.Text>
					)}
				</Space>
			),
			okText,
			cancelText,
			okType,
			centered,
			maskClosable: closeOnMaskClick,
			...(loading && { okButtonProps: { loading } }),
			onOk: onOk,
			onCancel,
		});
	},
};

// Specific modal types for common thesis operations
export const ThesisConfirmationModals = {
	create: (
		thesisTitle: string,
		onConfirm: () => void | Promise<void>,
		loading = false,
	) =>
		ConfirmationModal.show({
			title: 'Create Thesis',
			message: 'Are you sure you want to create this thesis?',
			details: thesisTitle,
			note: 'Once created, you can edit the thesis details before submitting for review.',
			noteType: 'info',
			okText: 'Yes, Create',
			loading,
			onOk: onConfirm,
		}),

	delete: (
		thesisTitle: string,
		onConfirm: () => void | Promise<void>,
		loading?: boolean,
	) => {
		const config = {
			title: 'Delete Thesis',
			message: 'Are you sure you want to delete this thesis?',
			details: thesisTitle,
			note: 'This action cannot be undone.',
			noteType: 'danger' as const,
			okText: 'Yes, Delete',
			okType: 'danger' as const,
			onOk: onConfirm,
			...(loading !== undefined && { loading }),
		};

		return ConfirmationModal.show(config);
	},

	submit: (
		thesisTitle: string,
		onConfirm: () => void | Promise<void>,
		loading?: boolean,
	) => {
		const config = {
			title: 'Submit Thesis for Review',
			message: 'Are you sure you want to submit this thesis for review?',
			details: thesisTitle,
			note: 'Once submitted, the status will change to "Pending" and the thesis will be reviewed by moderators.',
			noteType: 'info' as const,
			okText: 'Yes, Submit',
			onOk: onConfirm,
			...(loading !== undefined && { loading }),
		};

		return ConfirmationModal.show(config);
	},

	approve: (onConfirm: () => void | Promise<void>, loading = false) =>
		ConfirmationModal.show({
			title: 'Approve Thesis',
			message: 'Are you sure you want to approve this thesis?',
			note: 'Once approved, the thesis status will be changed to "Approved" and will be available for student registration.',
			noteType: 'info',
			okText: 'Yes, Approve',
			loading,
			onOk: onConfirm,
		}),

	reject: (onConfirm: () => void | Promise<void>, loading = false) =>
		ConfirmationModal.show({
			title: 'Reject Thesis',
			message: 'Are you sure you want to reject this thesis?',
			note: 'Once rejected, the thesis status will be changed to "Rejected" and the author will need to revise it.',
			noteType: 'warning',
			okText: 'Yes, Reject',
			okType: 'danger',
			loading,
			onOk: onConfirm,
		}),

	publish: (
		thesisTitle: string,
		isCurrentlyPublished: boolean,
		onConfirm: () => void | Promise<void>,
		loading = false,
	) => {
		const actionText = isCurrentlyPublished ? 'unpublish' : 'publish';
		const statusText = isCurrentlyPublished ? 'unpublished' : 'published';

		return ConfirmationModal.show({
			title: `${isCurrentlyPublished ? 'Unpublish' : 'Publish'} Thesis`,
			message: `Are you sure you want to ${actionText} this thesis?`,
			details: thesisTitle,
			note: `Once ${statusText}, the thesis will ${
				isCurrentlyPublished
					? 'no longer be available for student selection'
					: 'be available for students to select for their projects'
			}.`,
			noteType: isCurrentlyPublished ? 'warning' : 'info',
			okText: `Yes, ${isCurrentlyPublished ? 'Unpublish' : 'Publish'}`,
			okType: isCurrentlyPublished ? 'danger' : 'primary',
			loading,
			onOk: onConfirm,
		});
	},

	bulkPublish: (
		publishCount: number,
		totalSelected: number,
		onConfirm: () => void | Promise<void>,
		loading = false,
	) => {
		const skippedCount = totalSelected - publishCount;
		const skippedMessage =
			skippedCount > 0
				? ` (${skippedCount} thesis(es) will be skipped as they are already published or assigned to groups)`
				: '';

		return ConfirmationModal.show({
			title: 'Bulk Publish Theses',
			message: `Are you sure you want to publish ${publishCount} thesis(es)?`,
			details: `${publishCount} out of ${totalSelected} selected thesis(es) will be published${skippedMessage}`,
			note: 'Once published, these theses will be available for students to select for their projects.',
			noteType: 'info',
			okText: 'Yes, Publish All',
			loading,
			onOk: onConfirm,
		});
	},

	// Generic show method for custom modals (backwards compatibility)
	show: ConfirmationModal.show,
};

// Group-related confirmation modals
export const GroupConfirmationModals = {
	requestToJoin: (
		groupName: string,
		onConfirm: () => void | Promise<void>,
		loading = false,
	) =>
		ConfirmationModal.show({
			title: 'Request to Join Group',
			message: 'Are you sure you want to request to join this group?',
			details: groupName,
			note: 'The group leader will review your request and decide whether to accept or reject it.',
			noteType: 'info',
			okText: 'Send Request',
			loading,
			onOk: onConfirm,
		}),

	cancelJoinRequest: (
		groupName: string,
		onConfirm: () => void | Promise<void>,
		loading = false,
	) =>
		ConfirmationModal.show({
			title: 'Cancel Join Request',
			message: 'Are you sure you want to cancel your join request?',
			details: groupName,
			note: 'You can send another request later if you change your mind.',
			noteType: 'warning',
			okText: 'Yes, Cancel Request',
			okType: 'danger',
			loading,
			onOk: onConfirm,
		}),

	// Generic show method for custom modals
	show: ConfirmationModal.show,
};
