'use client';

import { Badge, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { TablePagination } from '@/components/common/TablePagination';
import { majorMap } from '@/data/major';
import { Student } from '@/schemas/student';

interface Props {
	data: ReadonlyArray<Student>;
}

export default function StudentTable({ data }: Readonly<Props>) {
	// Chỉ lấy những sinh viên chưa vào nhóm (isActive = false)
	const filteredData = data.filter((student) => !student.isActive);

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
			dataSource={filteredData}
			pagination={TablePagination}
			scroll={{ x: 'max-content' }}
		/>
	);
}
