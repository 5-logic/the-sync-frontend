'use client';

import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';

import majorService from '@/lib/services/majors.service';
import { Major } from '@/schemas/major';
import { Student } from '@/schemas/student';

type Props = Readonly<{
	data: Student[];
	loading: boolean;
}>;

export default function StudentTable({ data, loading }: Props) {
	const [majors, setMajors] = useState<Major[]>([]);
	const [majorsLoading, setMajorsLoading] = useState(false);

	useEffect(() => {
		const fetchMajors = async () => {
			try {
				setMajorsLoading(true);
				const response = await majorService.findAll();

				if (response.success) {
					setMajors(response.data);
				} else {
					console.error('Failed to fetch majors:', response.error);
				}
			} catch (error) {
				console.error('Error fetching majors:', error);
			} finally {
				setMajorsLoading(false);
			}
		};

		fetchMajors();
	}, []);

	const majorMap = majors.reduce(
		(acc, major) => {
			acc[major.id] = major.code;
			return acc;
		},
		{} as Record<string, string>,
	);

	const columns: ColumnsType<Student> = [
		{
			title: 'Student ID',
			dataIndex: 'studentId',
			key: 'studentId',
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
			width: '10%',
			render: (majorId: string) => {
				if (majorsLoading) {
					return 'Loading...';
				}
				return majorMap[majorId] || majorId;
			},
		},
		{
			title: 'Semester',
			dataIndex: 'semesterId',
			key: 'semesterId',
			width: '10%',
			render: () => {
				return '-';
			},
		},
		{
			title: 'Status',
			dataIndex: 'isActive',
			key: 'isActive',
			width: '10%',
			render: (isActive: boolean) => (
				<Tag color={isActive ? 'green' : 'default'}>
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
			}}
			scroll={{ x: 'max-content' }}
			loading={loading}
		/>
	);
}
