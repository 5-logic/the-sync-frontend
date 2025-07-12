import {
	CheckOutlined,
	CloseOutlined,
	EyeOutlined,
	StopOutlined,
} from '@ant-design/icons';
import { Button, Popconfirm, Space, Tooltip } from 'antd';

import {
	type ActionProps,
	type RequestsMode,
} from '@/components/common/RequestsManagement/types';

interface RequestsActionsProps {
	readonly requestId: string;
	readonly requestType: 'invite' | 'join';
	readonly targetName: string;
	readonly mode: RequestsMode;
	readonly status: string;
	readonly getActionProps: (
		requestId: string,
		requestType: 'Invite' | 'Join',
		targetName: string,
	) => ActionProps;
}

export default function RequestsActions({
	requestId,
	requestType,
	targetName,
	mode,
	status,
	getActionProps,
}: RequestsActionsProps) {
	const { primaryAction, secondaryAction, viewDetailAction } = getActionProps(
		requestId,
		requestType === 'invite' ? 'Invite' : 'Join',
		targetName,
	);

	const isStudentMode = mode === 'student';
	const isInviteType = requestType === 'invite';

	// Only show action buttons for pending requests
	const isPendingStatus = status === 'Pending';

	// Student mode - Invitations: Accept/Reject + View Detail
	if (isStudentMode && isInviteType) {
		return (
			<Space size="small">
				{/* View Detail button */}
				{viewDetailAction && (
					<Tooltip title="View Group Details" placement="bottom">
						<Button
							type="text"
							icon={<EyeOutlined />}
							size="small"
							className="text-blue-600 hover:text-blue-700"
							onClick={viewDetailAction.onViewDetail}
						/>
					</Tooltip>
				)}

				{/* Accept/Reject buttons - only show for pending requests */}
				{isPendingStatus && (
					<>
						{/* Accept button */}
						<Popconfirm
							title={primaryAction.title}
							description={primaryAction.description}
							okText={primaryAction.okText}
							cancelText="Cancel"
							okType={primaryAction.okType || 'primary'}
							onConfirm={primaryAction.onConfirm}
						>
							<Tooltip title="Accept Invitation" placement="bottom">
								<Button
									type="text"
									icon={<CheckOutlined />}
									size="small"
									className="text-green-600 hover:text-green-700"
								/>
							</Tooltip>
						</Popconfirm>

						{/* Reject button */}
						{secondaryAction && (
							<Popconfirm
								title={secondaryAction.title}
								description={secondaryAction.description}
								okText={secondaryAction.okText}
								cancelText="Cancel"
								okType={secondaryAction.okType || 'danger'}
								onConfirm={secondaryAction.onConfirm}
							>
								<Tooltip title="Reject Invitation" placement="bottom">
									<Button
										type="text"
										danger
										icon={<CloseOutlined />}
										size="small"
									/>
								</Tooltip>
							</Popconfirm>
						)}
					</>
				)}
			</Space>
		);
	}

	// Student mode - Join Requests: Cancel + View Detail
	if (isStudentMode && !isInviteType) {
		return (
			<Space size="small">
				{/* View Detail button */}
				{viewDetailAction && (
					<Tooltip title="View Group Details" placement="bottom">
						<Button
							type="text"
							icon={<EyeOutlined />}
							size="small"
							className="text-blue-600 hover:text-blue-700"
							onClick={viewDetailAction.onViewDetail}
						/>
					</Tooltip>
				)}

				{/* Cancel button - only show for pending requests */}
				{isPendingStatus && (
					<Popconfirm
						title={primaryAction.title}
						description={primaryAction.description}
						okText={primaryAction.okText}
						cancelText="Cancel"
						okType={primaryAction.okType || 'danger'}
						onConfirm={primaryAction.onConfirm}
					>
						<Tooltip title="Cancel Join Request" placement="bottom">
							<Button type="text" danger icon={<StopOutlined />} size="small" />
						</Tooltip>
					</Popconfirm>
				)}
			</Space>
		);
	}

	// Group leader mode - Invitations: Cancel only for pending, View Profile for all
	if (!isStudentMode && isInviteType) {
		return (
			<Space size="small" className="flex justify-center">
				{/* View Profile button for all requests */}
				{viewDetailAction && (
					<Tooltip title="View Student Profile" placement="bottom">
						<Button
							type="text"
							icon={<EyeOutlined />}
							size="small"
							className="text-blue-600 hover:text-blue-700"
							onClick={viewDetailAction.onViewDetail}
						/>
					</Tooltip>
				)}

				{/* Cancel button - only show for pending requests */}
				{isPendingStatus && (
					<Popconfirm
						title={primaryAction.title}
						description={primaryAction.description}
						okText={primaryAction.okText}
						cancelText="Cancel"
						okType={primaryAction.okType || 'danger'}
						onConfirm={primaryAction.onConfirm}
					>
						<Tooltip title="Cancel Invitation" placement="bottom">
							<Button type="text" danger icon={<StopOutlined />} size="small" />
						</Tooltip>
					</Popconfirm>
				)}
			</Space>
		);
	}

	// Group leader mode - Join Requests: View Profile + Approve/Reject (only for pending)
	return (
		<Space size="small">
			{/* View Profile button for all requests */}
			{viewDetailAction && (
				<Tooltip title="View Student Profile" placement="bottom">
					<Button
						type="text"
						icon={<EyeOutlined />}
						size="small"
						className="text-blue-600 hover:text-blue-700"
						onClick={viewDetailAction.onViewDetail}
					/>
				</Tooltip>
			)}

			{/* Only show approve/reject buttons for pending requests */}
			{isPendingStatus && (
				<>
					{/* Approve button */}
					<Popconfirm
						title={primaryAction.title}
						description={primaryAction.description}
						okText={primaryAction.okText}
						cancelText="Cancel"
						okType={primaryAction.okType || 'primary'}
						onConfirm={primaryAction.onConfirm}
					>
						<Tooltip title="Approve Request" placement="bottom">
							<Button
								type="text"
								icon={<CheckOutlined />}
								size="small"
								className="text-green-600 hover:text-green-700"
							/>
						</Tooltip>
					</Popconfirm>

					{/* Reject button */}
					{secondaryAction && (
						<Popconfirm
							title={secondaryAction.title}
							description={secondaryAction.description}
							okText={secondaryAction.okText}
							cancelText="Cancel"
							okType={secondaryAction.okType || 'danger'}
							onConfirm={secondaryAction.onConfirm}
						>
							<Tooltip title="Reject Request" placement="bottom">
								<Button
									type="text"
									danger
									icon={<CloseOutlined />}
									size="small"
								/>
							</Tooltip>
						</Popconfirm>
					)}
				</>
			)}
		</Space>
	);
}
