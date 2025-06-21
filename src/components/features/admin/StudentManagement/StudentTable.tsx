'use client';

import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { Student } from '@/schemas/student';

type Props = Readonly<{
	data: Student[];
	loading: boolean;
}>;

export default function StudentTable({ data, loading }: Props) {
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
				gender.charAt(0).toUpperCase() + gender.slice(1),
		},
		{
			title: 'Major',
			dataIndex: 'majorId',
			key: 'majorId',
			width: '20%',
			render: (majorId: string) => {
				const map: Record<string, string> = {
					SE: 'Software Engineering',
					AI: 'Artificial Intelligence',
				};
				return map[majorId] || majorId;
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
