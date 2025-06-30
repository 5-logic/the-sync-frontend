'use client';

import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { TablePagination } from '@/components/common/TablePagination';
import { Student } from '@/schemas/student';

type Props = Readonly<{
	data: Student[];
}>;

export default function StudentTable({ data }: Props) {
	const columns: ColumnsType<Student> = [
		{ title: 'Name', dataIndex: 'fullName', key: 'fullName' },
		{ title: 'Email', dataIndex: 'email', key: 'email' },
		{ title: 'Student ID', dataIndex: 'studentId', key: 'studentId' },
		{
			title: 'Major',
			dataIndex: 'majorId',
			key: 'majorId',
			render: (majorId: string) => {
				const map: Record<string, string> = {
					SE: 'Software Engineering',
					AI: 'Artificial Intelligence',
				};
				return map[majorId] || majorId;
			},
		},
		{
			title: 'Gender',
			dataIndex: 'gender',
			key: 'gender',
			render: (gender: string) =>
				gender.charAt(0).toUpperCase() + gender.slice(1),
		},
		{
			title: 'Status',
			dataIndex: 'isActive',
			key: 'isActive',
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
			pagination={TablePagination}
			scroll={{ x: 'max-content' }}
		/>
	);
}
