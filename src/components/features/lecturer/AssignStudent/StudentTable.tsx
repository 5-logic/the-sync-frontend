'use client';

import { Badge, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { majorMap } from '@/data/major';
import { Student } from '@/schemas/student';

// giả sử bạn có map mã ngành -> tên ngành

interface Props {
	data: Student[];
}

export default function StudentTable({ data }: Props) {
	const columns: ColumnsType<Student> = [
		{
			title: 'Name',
			dataIndex: 'fullName',
		},
		{
			title: 'Email',
			dataIndex: 'email',
		},
		{
			title: 'Major',
			dataIndex: 'majorId',
			render: (majorId: string) => majorMap[majorId] ?? majorId,
		},
		{
			title: 'Status',
			dataIndex: 'isActive',
			render: (isActive: boolean) => (
				<Badge
					status={isActive ? 'success' : 'default'}
					text={isActive ? 'In Group' : 'No Group'}
				/>
			),
		},
	];

	return (
		<Table
			rowKey="id"
			columns={columns}
			dataSource={data}
			pagination={{
				showTotal: (total, range) =>
					`${range[0]}-${range[1]} of ${total} students`,
				showSizeChanger: true,
				pageSizeOptions: ['10', '20', '50', '100'],
				defaultPageSize: 10,
			}}
			scroll={{ x: 'max-content' }}
		/>
	);
}
