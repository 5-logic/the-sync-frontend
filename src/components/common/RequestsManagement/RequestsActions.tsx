import { CheckOutlined, CloseOutlined, StopOutlined } from '@ant-design/icons';
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
	getActionProps,
}: RequestsActionsProps) {
	const { primaryAction, secondaryAction } = getActionProps(
		requestId,
		requestType === 'invite' ? 'Invite' : 'Join',
		targetName,
	);

	const isStudentMode = mode === 'student';
	const isInviteType = requestType === 'invite';

	// Student mode - Invitations: Accept/Reject
	if (isStudentMode && isInviteType) {
		return (
			<Space size="small">
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
			</Space>
		);
	}

	// Student mode - Join Requests: Cancel only
	if (isStudentMode && !isInviteType) {
		return (
			<div className="flex justify-center">
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
			</div>
		);
	}

	// Group leader mode - Invitations: Cancel only
	if (!isStudentMode && isInviteType) {
		return (
			<div className="flex justify-center">
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
			</div>
		);
	}

	// Group leader mode - Join Requests: Approve/Reject
	return (
		<Space size="small">
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
						<Button type="text" danger icon={<CloseOutlined />} size="small" />
					</Tooltip>
				</Popconfirm>
			)}
		</Space>
	);
}
