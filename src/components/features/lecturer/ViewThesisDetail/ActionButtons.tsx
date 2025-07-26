'use client';

import {
	CheckOutlined,
	CloseOutlined,
	DeleteOutlined,
	EyeInvisibleOutlined,
	EyeOutlined,
	SearchOutlined,
	SendOutlined,
} from '@ant-design/icons';
import { Button, Col, Row, Space } from 'antd';

import { THESIS_STATUS } from '@/lib/constants/thesis';

interface ActionButtonProps {
	onToggleDuplicate: () => void;
	onApprove?: () => void;
	onReject?: () => void;
	onExit?: () => void;
	onEdit?: () => void;
	onDelete?: () => void;
	onRegisterSubmit?: () => void;
	onPublishThesis?: () => void;
	status: string;
	canModerate?: boolean;
	isThesisOwner?: boolean;
	exitLoading?: boolean;
	deleteLoading?: boolean;
	submitLoading?: boolean;
	approveLoading?: boolean;
	rejectLoading?: boolean;
	publishLoading?: boolean;
	duplicateLoading?: boolean;
	mode?: 'thesis-management' | 'publish-list';
	isPublished?: boolean;
	canUnpublish?: boolean;
}

export default function ActionButtons({
	onToggleDuplicate,
	onApprove,
	onReject,
	onExit,
	onEdit,
	onDelete,
	onRegisterSubmit,
	onPublishThesis,
	status,
	canModerate = false,
	isThesisOwner = false,
	exitLoading = false,
	deleteLoading = false,
	submitLoading = false,
	approveLoading = false,
	rejectLoading = false,
	publishLoading = false,
	duplicateLoading = false,
	mode = 'thesis-management',
	isPublished = false,
	canUnpublish = true,
}: Readonly<ActionButtonProps>) {
	// Show duplicate check button for lecturers and moderators
	const showDuplicateCheck =
		(canModerate || isThesisOwner) &&
		(status === THESIS_STATUS.PENDING || status === THESIS_STATUS.NEW);

	// Determine if we should show moderator actions (Approve/Reject)
	// BUSINESS LOGIC: Only show for "Pending" status and only for moderators (not thesis owners)
	const showModeratorActions = canModerate && status === THESIS_STATUS.PENDING;

	// SECURITY FIX: Only show register submit button for thesis owner (in thesis management mode)
	const showRegisterSubmit = isThesisOwner && mode === 'thesis-management';

	// Show publish thesis button when in publish-list mode
	const showPublishThesis = mode === 'publish-list';

	// SECURITY FIX: Only allow delete for thesis owner AND correct status
	const canDelete =
		isThesisOwner &&
		(status === THESIS_STATUS.NEW || status === THESIS_STATUS.REJECTED);

	// SECURITY FIX: Only allow edit for thesis owner AND (new, rejected, or approved status)
	const canEdit =
		isThesisOwner &&
		(status === THESIS_STATUS.NEW ||
			status === THESIS_STATUS.REJECTED ||
			status === THESIS_STATUS.APPROVED);

	// Register submit button text and state
	const getRegisterSubmitProps = () => {
		if (status === THESIS_STATUS.PENDING) {
			return {
				children: 'Already Submitted',
				disabled: true,
				loading: false,
			};
		}
		if (status === THESIS_STATUS.REJECTED) {
			return {
				children: 'Resubmit for Review',
				disabled: false,
				loading: submitLoading,
			};
		}
		return {
			children: 'Register Submit',
			disabled: status !== THESIS_STATUS.NEW,
			loading: submitLoading,
		};
	};

	return (
		<>
			{status === THESIS_STATUS.REJECTED ? (
				<Row justify="end">
					<Space>
						<Button onClick={onExit} loading={exitLoading}>
							Exit
						</Button>
						{canDelete && (
							<Button
								danger
								icon={<DeleteOutlined />}
								onClick={onDelete}
								loading={deleteLoading}
							>
								Delete
							</Button>
						)}
						{canEdit && (
							<Button type="primary" onClick={onEdit}>
								Edit Thesis
							</Button>
						)}
						{showRegisterSubmit && (
							<Button
								type="primary"
								icon={<SendOutlined />}
								onClick={onRegisterSubmit}
								loading={submitLoading}
							>
								Resubmit for Review
							</Button>
						)}
					</Space>
				</Row>
			) : (
				<Row justify="space-between">
					<Col>
						{showDuplicateCheck && (
							<Button
								icon={<SearchOutlined />}
								onClick={onToggleDuplicate}
								type="primary"
								loading={duplicateLoading}
							>
								Check Similar Thesis
							</Button>
						)}
					</Col>
					<Col>
						<Space>
							<Button onClick={onExit} loading={exitLoading}>
								Exit
							</Button>

							{canDelete && (
								<Button
									danger
									icon={<DeleteOutlined />}
									onClick={onDelete}
									loading={deleteLoading}
								>
									Delete
								</Button>
							)}

							{canEdit && (
								<Button type="primary" onClick={onEdit}>
									Edit Thesis
								</Button>
							)}

							{showRegisterSubmit && (
								<Button
									type="primary"
									icon={<SendOutlined />}
									onClick={onRegisterSubmit}
									{...getRegisterSubmitProps()}
								/>
							)}

							{showPublishThesis && (
								<Button
									type="primary"
									icon={
										isPublished ? <EyeInvisibleOutlined /> : <EyeOutlined />
									}
									onClick={onPublishThesis}
									loading={publishLoading}
									disabled={isPublished && !canUnpublish}
								>
									{isPublished ? 'Unpublish Thesis' : 'Publish Thesis'}
								</Button>
							)}

							{showModeratorActions && (
								<>
									<Button
										danger
										icon={<CloseOutlined />}
										onClick={onReject}
										loading={rejectLoading}
									>
										Reject
									</Button>
									<Button
										type="primary"
										icon={<CheckOutlined />}
										onClick={onApprove}
										loading={approveLoading}
									>
										Approve
									</Button>
								</>
							)}
						</Space>
					</Col>
				</Row>
			)}
		</>
	);
}
