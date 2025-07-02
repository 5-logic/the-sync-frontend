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
							{noteType === 'warning'
								? 'Warning: '
								: noteType === 'danger'
									? 'Warning: '
									: 'Note: '}
							{note}
						</Typography.Text>
					)}
				</Space>
			),
			okText,
			cancelText,
			okType,
			centered,
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

	// Generic show method for custom modals (backwards compatibility)
	show: ConfirmationModal.show,
};
