'use client';

import { Empty, Modal, Switch, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo } from 'react';

import { TablePagination } from '@/components/common/TablePagination';
import { Student } from '@/schemas/student';
import { useMajorStore, useStudentStore } from '@/store';

type Props = Readonly<{
	data: Student[];
	loading: boolean;
}>;

// Helper: render gender
function renderGender(gender: string) {
	return gender?.charAt(0).toUpperCase() + gender?.slice(1);
}

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
	const { toggleStudentStatus, isStudentLoading } = useStudentStore();

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

	const columns: ColumnsType<Student> = [
		{
			title: 'Student ID',
			dataIndex: 'studentId',
			key: 'studentId',
			width: '15%',
		},
		{
			title: 'Name',
			dataIndex: 'fullName',
			key: 'fullName',
			width: '22%',
		},
		{
			title: 'Email',
			dataIndex: 'email',
			key: 'email',
			width: '25%',
		},
		{
			title: 'Gender',
			dataIndex: 'gender',
			key: 'gender',
			width: '10%',
			render: renderGender,
		},
		{
			title: 'Major',
			dataIndex: 'majorId',
			key: 'majorId',
			width: '18%',
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
	];

	return (
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
	);
}
