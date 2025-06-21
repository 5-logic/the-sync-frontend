'use client';

import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo } from 'react';

import { Student } from '@/schemas/student';
import { useMajorStore } from '@/store/useMajorStore';
import { useSemesterStore } from '@/store/useSemesterStore';

type Props = Readonly<{
	data: Student[];
	loading: boolean;
}>;

export default function StudentTable({ data, loading }: Props) {
	// Use Major Store
	const { majors, loading: majorsLoading, fetchMajors } = useMajorStore();

	// Use Semester Store - Replace local semester state
	const {
		semesters,
		loading: semestersLoading,
		fetchSemesters,
	} = useSemesterStore();

	// Fetch data using stores
	useEffect(() => {
		fetchMajors();
		fetchSemesters();
	}, [fetchMajors, fetchSemesters]);

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

	const semesterMap = useMemo(() => {
		return semesters.reduce(
			(acc, semester) => {
				acc[semester.id] = {
					code: semester.code,
					name: semester.name,
				};
				return acc;
			},
			{} as Record<string, { code: string; name: string }>,
		);
	}, [semesters]);

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
			width: '25%',
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
			width: '12%',
			render: (majorId: string) => {
				if (majorsLoading) {
					return 'Loading...';
				}

				const major = majorMap[majorId];
				return major ? major.code : 'Unknown';
			},
		},
		{
			title: 'Semester',
			dataIndex: 'semesterId',
			key: 'semesterId',
			width: '12%',
			render: (semesterId: string) => {
				if (semestersLoading) {
					return 'Loading...';
				}

				if (!semesterId) {
					return '';
				}

				const semester = semesterMap[semesterId];
				return semester ? semester.code : 'Unknown';
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
			pagination={{
				showTotal: (total, range) =>
					`${range[0]}-${range[1]} of ${total} items`,
				showSizeChanger: true,
				pageSizeOptions: ['5', '10', '20', '50'],
				defaultPageSize: 10,
			}}
			scroll={{ x: 'max-content' }}
			loading={loading}
			size="middle"
		/>
	);
}
