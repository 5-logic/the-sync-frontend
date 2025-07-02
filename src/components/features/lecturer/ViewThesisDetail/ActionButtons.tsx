'use client';

import {
	CheckOutlined,
	CloseOutlined,
	DeleteOutlined,
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
	status: string;
	canModerate?: boolean;
	isThesisOwner?: boolean;
	exitLoading?: boolean;
	deleteLoading?: boolean;
	submitLoading?: boolean;
	approveLoading?: boolean;
	rejectLoading?: boolean;
}

export default function ActionButtons({
	onToggleDuplicate,
	onApprove,
	onReject,
	onExit,
	onEdit,
	onDelete,
	onRegisterSubmit,
	status,
	canModerate = false,
	isThesisOwner = false,
	exitLoading = false,
	deleteLoading = false,
	submitLoading = false,
	approveLoading = false,
	rejectLoading = false,
}: Readonly<ActionButtonProps>) {
	// Determine if we should show moderator actions (Approve/Reject)
	// BUSINESS LOGIC: Only show for "Pending" status (already submitted for review)
	// "New" status means not submitted yet, so no need for approval
	const showModeratorActions = canModerate && status === THESIS_STATUS.PENDING;

	// SECURITY FIX: Only show register submit button for thesis owner
	const showRegisterSubmit = isThesisOwner;

	// SECURITY FIX: Only allow delete for thesis owner AND correct status
	const canDelete =
		isThesisOwner &&
		(status === THESIS_STATUS.NEW || status === THESIS_STATUS.REJECTED);

	// SECURITY FIX: Only allow edit for thesis owner AND rejected status
	const canEdit = isThesisOwner && status === THESIS_STATUS.REJECTED;

	// Register submit button text and state
	const getRegisterSubmitProps = () => {
		if (status === THESIS_STATUS.PENDING) {
			return {
				children: 'Already Submitted',
				disabled: true,
				loading: false,
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
					</Space>
				</Row>
			) : (
				<Row justify="space-between">
					<Col>
						<Button
							icon={<SearchOutlined />}
							onClick={onToggleDuplicate}
							type="primary"
						>
							Duplicate Thesis Detection
						</Button>
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

							{showRegisterSubmit && (
								<Button
									type="primary"
									icon={<SendOutlined />}
									onClick={onRegisterSubmit}
									{...getRegisterSubmitProps()}
								/>
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
