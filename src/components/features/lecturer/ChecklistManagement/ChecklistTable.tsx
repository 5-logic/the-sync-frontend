import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { Checklist } from '@/schemas/checklist';

interface Props {
	data: Checklist[];
	getTotalItems: (checklistId: string) => number;
}

export default function ChecklistTable({ data, getTotalItems }: Props) {
	const columns: ColumnsType<Checklist> = [
		{
			title: 'Checklist Name',
			dataIndex: 'name',
			key: 'name',
		},
		{
			title: 'Description',
			dataIndex: 'description',
			key: 'description',
		},
		{
			title: 'createdAt',
			dataIndex: 'createdAt',
			key: 'createdAt',
			render: (date: Date) => new Date(date).toLocaleDateString(),
		},
		{
			title: 'updatedAt',
			dataIndex: 'updatedAt',
			key: 'updatedAt',
			render: (date: Date) => new Date(date).toLocaleDateString(),
		},
		{
			title: 'Total Items',
			key: 'totalItems',
			render: (_, record) => getTotalItems(record.id),
		},
		{
			title: 'Action',
			key: 'action',
			render: () => <span style={{ cursor: 'pointer' }}>⋮</span>,
		},
	];

	return (
		<Table
			rowKey="id"
			columns={columns}
			dataSource={data}
			pagination={false}
			scroll={{ x: 'max-content' }}
		/>
	);
}
