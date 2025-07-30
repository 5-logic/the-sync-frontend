'use client';

import {
	DeleteOutlined,
	EditOutlined,
	ExclamationCircleOutlined,
} from '@ant-design/icons';
import {
	Alert,
	Button,
	Empty,
	Modal,
	Space,
	Switch,
	Table,
	Tooltip,
	Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo, useState } from 'react';

import { TablePagination } from '@/components/common/TablePagination';
import EditStudentDialog from '@/components/features/admin/StudentManagement/EditStudentDialog';
import { Student } from '@/schemas/student';
import { useMajorStore, useStudentStore } from '@/store';

type Props = Readonly<{
	data: Student[];
	loading: boolean;
}>;

// Helper: render major
function renderMajor(
	majorId: string,
	majorMap: Record<string, { code: string; name: string }>,
	majorsLoading: boolean,
) {
	if (majorsLoading) return 'Loading...';
	const major = majorMap[majorId];
	return major ? major.name : 'Unknown';
}

// Helper: render status switch
function renderStatusSwitch(
	record: Student,
	handleStatusToggle: (record: Student) => void,
	isStudentLoading: (id: string) => boolean,
) {
	return (
		<Switch
			checked={record.isActive}
			onChange={() => handleStatusToggle(record)}
			loading={isStudentLoading(record.id)}
			checkedChildren="Active"
			unCheckedChildren="Inactive"
		/>
	);
}

// Helper: majorMap
function getMajorMap(majors: { id: string; code: string; name: string }[]) {
	return majors.reduce(
		(acc, major) => {
			acc[major.id] = { code: major.code, name: major.name };
			return acc;
		},
		{} as Record<string, { code: string; name: string }>,
	);
}

// Handle status toggle
function showStatusToggleModal(
	record: Student,
	toggleStudentStatus: (
		id: string,
		data: { isActive: boolean },
	) => Promise<boolean>,
) {
	const newStatus = !record.isActive;
	const statusText = newStatus ? 'Active' : 'Inactive';

	Modal.confirm({
		title: 'Update Student Status',
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
			setTimeout(() => {
				toggleStudentStatus(record.id, { isActive: newStatus }).catch(
					(error) => {
						console.error('Error toggling student status:', error);
					},
				);
			}, 0);
			return Promise.resolve();
		},
		onCancel: () => {},
	});
}

export default function StudentTable({ data, loading }: Props) {
	// Use stores
	const { majors, loading: majorsLoading, fetchMajors } = useMajorStore();
	const { toggleStudentStatus, isStudentLoading, deleteStudent, deleting } =
		useStudentStore();

	// Dialog states
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

	// Fetch data using stores
	useEffect(() => {
		fetchMajors();
	}, [fetchMajors]);

	// Create maps for efficient lookups
	const majorMap = useMemo(() => getMajorMap(majors), [majors]);

	// Handle status toggle
	const handleStatusToggle = (record: Student) => {
		showStatusToggleModal(record, toggleStudentStatus);
	};

	// Handle edit student
	const handleEditStudent = (student: Student) => {
		setSelectedStudent(student);
		setEditDialogOpen(true);
	};

	// Handle close edit dialog
	const handleCloseEditDialog = () => {
		setEditDialogOpen(false);
		setSelectedStudent(null);
	};

	// Handle delete student
	const handleDeleteStudent = (student: Student) => {
		const { Text, Title } = Typography;

		Modal.confirm({
			title: (
				<Space>
					<Title level={4} style={{ margin: 0 }}>
						Delete Student
					</Title>
				</Space>
			),
			content: (
				<Space direction="vertical" size="middle" style={{ width: '100%' }}>
					<Text>Are you sure you want to delete this student?</Text>

					<Space direction="vertical" size="small" style={{ width: '100%' }}>
						<div>
							<Text strong>Student Code: </Text>
							<Text>{student.studentCode}</Text>
						</div>
						<div>
							<Text strong>Name: </Text>
							<Text>{student.fullName}</Text>
						</div>
						<div>
							<Text strong>Email: </Text>
							<Text>{student.email}</Text>
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
				return await deleteStudent(student.id);
			},
			centered: true,
			width: 480,
		});
	};

	const columns: ColumnsType<Student> = [
		{
			title: 'Student Code',
			dataIndex: 'studentCode',
			key: 'studentCode',
			width: '10%',
		},
		{
			title: 'Name',
			dataIndex: 'fullName',
			key: 'fullName',
			width: '25%',
		},
		{
			title: 'Email',
			dataIndex: 'email',
			key: 'email',
			width: '25%',
		},
		{
			title: 'Major',
			dataIndex: 'majorId',
			key: 'majorId',
			width: '15%',
			render: (majorId: string) =>
				renderMajor(majorId, majorMap, majorsLoading),
		},
		{
			title: 'Status',
			dataIndex: 'isActive',
			key: 'isActive',
			width: '10%',
			render: (_: boolean, record: Student) =>
				renderStatusSwitch(record, handleStatusToggle, isStudentLoading),
		},
		{
			title: 'Actions',
			key: 'actions',
			width: '10%',
			align: 'center',
			render: (_, record: Student) => (
				<Space size="middle">
					<Tooltip title="Edit Student">
						<Button
							icon={<EditOutlined />}
							size="small"
							type="text"
							onClick={() => handleEditStudent(record)}
						/>
					</Tooltip>
					<Tooltip title="Delete Student">
						<Button
							icon={<DeleteOutlined />}
							size="small"
							type="text"
							danger
							disabled={deleting}
							onClick={() => handleDeleteStudent(record)}
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
				pagination={TablePagination}
				scroll={{ x: 'max-content' }}
				loading={loading}
				size="middle"
				locale={{
					emptyText: (
						<Empty
							description="No students found for this semester. This might be because the semester hasn't started enrollment yet or has ended."
							image={Empty.PRESENTED_IMAGE_SIMPLE}
						/>
					),
				}}
			/>
			<EditStudentDialog
				open={editDialogOpen}
				student={selectedStudent}
				onClose={handleCloseEditDialog}
			/>
		</>
	);
}
