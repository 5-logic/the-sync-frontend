import {
	DeleteOutlined,
	EditOutlined,
	ExclamationCircleOutlined,
} from '@ant-design/icons';
import {
	Alert,
	Button,
	Modal,
	Space,
	Switch,
	Table,
	Tooltip,
	Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';

import { TablePagination } from '@/components/common/TablePagination';
import { Lecturer } from '@/schemas/lecturer';
import { useLecturerStore } from '@/store';

// Import EditLecturerDialog component
import EditLecturerDialog from './EditLecturerDialog';

type Props = Readonly<{
	data: Lecturer[];
	onTogglePermission: (id: string) => void;
	onToggleStatus: (id: string) => void;
	loading?: boolean;
}>;

const { Text, Title } = Typography;

export default function LecturerTable({
	data,
	onTogglePermission,
	onToggleStatus,
	loading = false,
}: Props) {
	const {
		isLecturerStatusLoading,
		isLecturerModeratorLoading,
		deleteLecturer,
		deleting,
	} = useLecturerStore();

	// Dialog states
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [selectedLecturer, setSelectedLecturer] = useState<Lecturer | null>(
		null,
	);

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
						{statusText}
					</strong>{' '}
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
						{roleText}
					</strong>{' '}
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

	// Handle edit lecturer
	const handleEditLecturer = (lecturer: Lecturer) => {
		setSelectedLecturer(lecturer);
		setEditDialogOpen(true);
	};

	// Handle close edit dialog
	const handleCloseEditDialog = () => {
		setEditDialogOpen(false);
		setSelectedLecturer(null);
	};

	// Handle delete lecturer
	const handleDeleteLecturer = (lecturer: Lecturer) => {
		Modal.confirm({
			title: (
				<Space>
					<Title level={4} style={{ margin: 0 }}>
						Delete Lecturer
					</Title>
				</Space>
			),
			content: (
				<Space direction="vertical" size="middle" style={{ width: '100%' }}>
					<Text>Are you sure you want to delete this lecturer?</Text>

					<Space direction="vertical" size="small" style={{ width: '100%' }}>
						<div>
							<Text strong>Name: </Text>
							<Text>{lecturer.fullName}</Text>
						</div>
						<div>
							<Text strong>Email: </Text>
							<Text>{lecturer.email}</Text>
						</div>
						<div>
							<Text strong>Phone: </Text>
							<Text>{lecturer.phoneNumber}</Text>
						</div>
					</Space>

					<Alert
						message="This action cannot be undone."
						type="warning"
						icon={<ExclamationCircleOutlined />}
						showIcon
						style={{ marginTop: 8 }}
					/>
				</Space>
			),
			okText: 'Delete',
			okType: 'danger',
			cancelText: 'Cancel',
			onOk: async () => {
				return await deleteLecturer(lecturer.id);
			},
			centered: true,
			width: 480,
		});
	};

	const columns: ColumnsType<Lecturer> = [
		{ title: 'Name', dataIndex: 'fullName', key: 'fullName', width: '25%' },
		{ title: 'Email', dataIndex: 'email', key: 'email', width: '25%' },
		{
			title: 'Phone Number',
			dataIndex: 'phoneNumber',
			key: 'phoneNumber',
			width: '20%',
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
		{
			title: 'Actions',
			key: 'actions',
			width: '10%',
			align: 'center',
			render: (_, record: Lecturer) => (
				<Space size="middle">
					<Tooltip title="Edit Lecturer">
						<Button
							icon={<EditOutlined />}
							size="small"
							type="text"
							onClick={() => handleEditLecturer(record)}
						/>
					</Tooltip>
					<Tooltip title="Delete Lecturer">
						<Button
							icon={<DeleteOutlined />}
							size="small"
							type="text"
							danger
							disabled={deleting}
							onClick={() => handleDeleteLecturer(record)}
						/>
					</Tooltip>
				</Space>
			),
		},
	];

	return (
		<>
			<Table
				columns={columns}
				dataSource={data}
				rowKey="id"
				scroll={{ x: 'max-content' }}
				pagination={TablePagination}
				loading={loading}
			/>
			<EditLecturerDialog
				open={editDialogOpen}
				lecturer={selectedLecturer}
				onClose={handleCloseEditDialog}
			/>
		</>
	);
}
