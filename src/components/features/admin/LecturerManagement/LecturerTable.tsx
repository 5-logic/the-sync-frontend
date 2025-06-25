import { Modal, Switch, Table } from 'antd';

import { TablePagination } from '@/components/common/TablePagination';
import { Lecturer } from '@/schemas/lecturer';

type Props = Readonly<{
	data: Lecturer[];
	onTogglePermission: (id: string) => void;
	onToggleStatus: (id: string) => void;
	loading?: boolean;
}>;

export default function LecturerTable({
	data,
	onTogglePermission,
	onToggleStatus,
	loading = false,
}: Props) {
	// Handle status toggle with confirmation
	const handleStatusToggle = (record: Lecturer) => {
		const newStatus = !record.isActive;
		const statusText = newStatus ? 'Active' : 'Inactive';

		Modal.confirm({
			title: 'Update Lecturer Status',
			content: `Are you sure you want to change ${record.fullName}'s status to ${statusText}?`,
			okText: 'Yes, Update',
			cancelText: 'Cancel',
			centered: true,
			onOk: () => onToggleStatus(record.id),
		});
	};

	// Handle moderator toggle with confirmation
	const handleModeratorToggle = (record: Lecturer) => {
		const newRole = !record.isModerator;
		const roleText = newRole ? 'Moderator' : 'Lecturer';

		Modal.confirm({
			title: 'Update Lecturer Role',
			content: `Are you sure you want to change ${record.fullName}'s role to ${roleText}?`,
			okText: 'Yes, Update',
			cancelText: 'Cancel',
			centered: true,
			onOk: () => onTogglePermission(record.id),
		});
	};
	const columns = [
		{ title: 'Name', dataIndex: 'fullName', key: 'fullName', width: '25%' },
		{ title: 'Email', dataIndex: 'email', key: 'email', width: '25%' },
		{
			title: 'Phone Number',
			dataIndex: 'phoneNumber',
			key: 'phoneNumber',
			width: '18%',
		},
		{ title: 'Gender', dataIndex: 'gender', key: 'gender', width: '12%' },
		{
			title: 'Status',
			dataIndex: 'isActive',
			key: 'isActive',
			width: '10%',
			render: (_: boolean, record: Lecturer) => (
				<Switch
					checked={record.isActive}
					onChange={() => handleStatusToggle(record)}
					loading={loading}
					checkedChildren="Active"
					unCheckedChildren="Inactive"
				/>
			),
		},
		{
			title: 'Moderator',
			dataIndex: 'isModerator',
			key: 'isModerator',
			width: '10%',
			render: (_: boolean, record: Lecturer) => (
				<Switch
					checked={record.isModerator}
					onChange={() => handleModeratorToggle(record)}
					loading={loading}
					disabled={!record.isActive}
				/>
			),
		},
	];
	return (
		<Table
			columns={columns}
			dataSource={data}
			rowKey="id"
			scroll={{ x: 'max-content' }}
			pagination={TablePagination}
			loading={loading}
		/>
	);
}
