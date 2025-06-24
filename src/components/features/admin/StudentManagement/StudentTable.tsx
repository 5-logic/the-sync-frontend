'use client';

import { Modal, Switch, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo } from 'react';

import { TablePagination } from '@/components/common/TablePagination';
import { Student } from '@/schemas/student';
import { useMajorStore, useStudentStore } from '@/store';

type Props = Readonly<{
	data: Student[];
	loading: boolean;
	onReload?: () => void;
}>;

export default function StudentTable({ data, loading, onReload }: Props) {
	// Use stores
	const { majors, loading: majorsLoading, fetchMajors } = useMajorStore();
	const { toggleStudentStatus } = useStudentStore();

	// Fetch data using stores
	useEffect(() => {
		fetchMajors();
	}, [fetchMajors]);

	// Create maps for efficient lookups
	const majorMap = useMemo(() => {
		return majors.reduce(
			(acc, major) => {
				acc[major.id] = {
					code: major.code,
					name: major.name,
				};
				return acc;
			},
			{} as Record<string, { code: string; name: string }>,
		);
	}, [majors]); // Handle status toggle
	const handleStatusToggle = (record: Student) => {
		const newStatus = !record.isActive;
		const statusText = newStatus ? 'Active' : 'Inactive';

		Modal.confirm({
			title: 'Update Student Status',
			content: `Are you sure you want to change ${record.fullName}'s status to ${statusText}?`,
			okText: 'Yes, Update',
			cancelText: 'Cancel',
			centered: true,
			onOk: async () => {
				try {
					const success = await toggleStudentStatus(record.id, {
						isActive: newStatus,
					});

					if (success) {
						if (onReload) {
							onReload();
						}
					}
				} catch (error) {
					console.error('Error toggling student status:', error);
				}
			},
		});
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
			render: (gender: string) =>
				gender?.charAt(0).toUpperCase() + gender?.slice(1),
		},
		{
			title: 'Major',
			dataIndex: 'majorId',
			key: 'majorId',
			width: '18%',
			render: (majorId: string) => {
				if (majorsLoading) {
					return 'Loading...';
				}

				const major = majorMap[majorId];
				return major ? major.name : 'Unknown';
			},
		},
		{
			title: 'Status',
			dataIndex: 'isActive',
			key: 'isActive',
			width: '10%',
			render: (_: boolean, record: Student) => (
				<Switch
					checked={record.isActive}
					onChange={() => handleStatusToggle(record)}
					loading={loading}
					checkedChildren="Active"
					unCheckedChildren="Inactive"
				/>
			),
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
		/>
	);
}
