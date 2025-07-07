import { StopOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Tooltip } from 'antd';

interface InviteActionsProps {
	readonly requestId: string;
	readonly studentName: string;
	readonly getPopconfirmProps: (
		requestId: string,
		status: 'Approved' | 'Rejected',
		requestType: 'Invite' | 'Join',
		studentName: string,
	) => {
		title: string;
		description: string;
		okText: string;
		cancelText: string;
		okType: 'danger' | 'primary';
		onConfirm: () => void;
	};
}

export default function InviteActions({
	requestId,
	studentName,
	getPopconfirmProps,
}: InviteActionsProps) {
	return (
		<div className="flex justify-center">
			<Popconfirm
				{...getPopconfirmProps(requestId, 'Rejected', 'Invite', studentName)}
			>
				<Tooltip title="Cancel Invitation" placement="bottom">
					<Button type="text" danger icon={<StopOutlined />} size="small" />
				</Tooltip>
			</Popconfirm>
		</div>
	);
}
