import { Modal, Switch, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { TablePagination } from '@/components/common/TablePagination';
import { Lecturer } from '@/schemas/lecturer';
import { useLecturerStore } from '@/store';

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
	const { isLecturerStatusLoading, isLecturerModeratorLoading } =
		useLecturerStore();
	// Handle status toggle with confirmation
	const handleStatusToggle = (record: Lecturer) => {
		const newStatus = !record.isActive;
		const statusText = newStatus ? 'Active' : 'Inactive';

		Modal.confirm({
			title: 'Update Lecturer Status',
			content: (
				<div>
					Are you sure you want to change <strong>{record.fullName}</strong>
					&apos;s status to{' '}
					<strong style={{ color: newStatus ? '#52c41a' : '#ff4d4f' }}>
						{statusText}{' '}
					</strong>
					?
				</div>
			),
			okText: 'Yes, Update',
			cancelText: 'Cancel',
			type: 'warning',
			centered: true,
			maskClosable: true,
			onOk: () => {
				// Fire & forget pattern - return resolved Promise immediately
				setTimeout(() => {
					onToggleStatus(record.id);
				}, 0);
				return Promise.resolve();
			},
			onCancel: () => {
				// Modal cancelled - no action needed
			},
		});
	};

	// Handle moderator toggle with confirmation
	const handleModeratorToggle = (record: Lecturer) => {
		const newRole = !record.isModerator;
		const roleText = newRole ? 'Moderator' : 'Lecturer';

		Modal.confirm({
			title: 'Update Lecturer Role',
			content: (
				<div>
					Are you sure you want to change <strong>{record.fullName}</strong>
					&apos;s role to{' '}
					<strong style={{ color: newRole ? '#1890ff' : '#52c41a' }}>
						{roleText}{' '}
					</strong>
					?
				</div>
			),
			okText: 'Yes, Update',
			cancelText: 'Cancel',
			type: 'warning',
			centered: true,
			maskClosable: true,
			onOk: () => {
				// Fire & forget pattern - return resolved Promise immediately
				setTimeout(() => {
					onTogglePermission(record.id);
				}, 0);
				return Promise.resolve();
			},
			onCancel: () => {
				// Modal cancelled - no action needed
			},
		});
	};

	const columns: ColumnsType<Lecturer> = [
		{ title: 'Name', dataIndex: 'fullName', key: 'fullName', width: '25%' },
		{ title: 'Email', dataIndex: 'email', key: 'email', width: '25%' },
		{
			title: 'Phone Number',
			dataIndex: 'phoneNumber',
			key: 'phoneNumber',
			width: '18%',
		},
		{
			title: 'Gender',
			dataIndex: 'gender',
			key: 'gender',
			width: '12%',
			render: (gender: string) =>
				gender?.charAt(0).toUpperCase() + gender?.slice(1),
		},
		{
			title: 'Status',
			dataIndex: 'isActive',
			key: 'isActive',
			width: '10%',
			render: (_: boolean, record: Lecturer) => (
				<Switch
					checked={record.isActive}
					onChange={() => handleStatusToggle(record)}
					loading={isLecturerStatusLoading(record.id)}
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
					loading={isLecturerModeratorLoading(record.id)}
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
