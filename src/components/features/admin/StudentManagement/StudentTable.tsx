'use client';

import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo } from 'react';

import { TablePagination } from '@/components/common/TablePagination';
import { Student } from '@/schemas/student';
import { useMajorStore } from '@/store/useMajorStore';

type Props = Readonly<{
	data: Student[];
	loading: boolean;
}>;

export default function StudentTable({ data, loading }: Props) {
	// Use Major Store
	const { majors, loading: majorsLoading, fetchMajors } = useMajorStore();

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
	}, [majors]);

	const columns: ColumnsType<Student> = [
		{
			title: 'Student ID',
			dataIndex: 'studentId',
			key: 'studentId',
			width: '12%',
		},
		{
			title: 'Name',
			dataIndex: 'fullName',
			key: 'fullName',
			width: '30%',
		},
		{
			title: 'Email',
			dataIndex: 'email',
			key: 'email',
			width: '30%',
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
			width: '15%',
			render: (majorId: string) => {
				if (majorsLoading) {
					return 'Loading...';
				}

				const major = majorMap[majorId];
				return major ? major.code : 'Unknown';
			},
		},
		{
			title: 'Status',
			dataIndex: 'isActive',
			key: 'isActive',
			width: '10%',
			render: (isActive: boolean) => (
				<Tag color={isActive ? 'green' : 'red'}>
					{isActive ? 'Active' : 'Inactive'}
				</Tag>
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
