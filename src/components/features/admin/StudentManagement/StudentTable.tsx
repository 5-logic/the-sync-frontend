'use client';

import { Table, Tag } from 'antd';

import { Student } from '@/types/student';

type Props = Readonly<{
	data: Student[];
}>;

export default function StudentTable({ data }: Props) {
	const columns = [
		{ title: 'Name', dataIndex: 'name', key: 'name' },
		{ title: 'Email', dataIndex: 'email', key: 'email' },
		{ title: 'Student ID', dataIndex: 'studentID', key: 'studentID' },
		{ title: 'Major', dataIndex: 'major', key: 'major' },
		{ title: 'Gender', dataIndex: 'gender', key: 'gender' },
		{
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
			render: (status: string) => (
				<Tag color={status === 'Active' ? 'green' : 'default'}>{status}</Tag>
			),
		},
	];

	return (
		<Table
			columns={columns}
			dataSource={data}
			pagination={{
				showTotal: (total, range) =>
					`${range[0]}-${range[1]} of ${total} items`,
				showSizeChanger: true,
				pageSizeOptions: ['5', '10', '20', '50'],
			}}
			rowKey="key"
			scroll={{ x: 'max-content' }}
		/>
	);
}
