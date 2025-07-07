import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Tooltip } from 'antd';

interface JoinActionsProps {
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

export default function JoinActions({
	requestId,
	studentName,
	getPopconfirmProps,
}: JoinActionsProps) {
	return (
		<div className="flex gap-2 justify-center">
			<Popconfirm
				{...getPopconfirmProps(requestId, 'Approved', 'Join', studentName)}
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
			<Popconfirm
				{...getPopconfirmProps(requestId, 'Rejected', 'Join', studentName)}
			>
				<Tooltip title="Reject Request" placement="bottom">
					<Button type="text" danger icon={<CloseOutlined />} size="small" />
				</Tooltip>
			</Popconfirm>
		</div>
	);
}
