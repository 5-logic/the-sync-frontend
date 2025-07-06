'use client';

import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import { Space, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { Checklist } from '@/schemas/checklist';

interface Props {
	readonly data: Checklist[];
	readonly getTotalItems: (checklistId: string) => number;
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
			render: (text) => text ?? <i>No description</i>,
		},
		{
			title: 'Semester',
			dataIndex: 'semester',
			key: 'semester',
		},
		{
			title: 'Milestone',
			dataIndex: 'milestone',
			key: 'milestone',
		},
		{
			title: 'Total Items',
			key: 'totalItems',
			render: (_, record) => getTotalItems(record.id),
		},
		{
			title: 'Action',
			key: 'action',
			render: (_, record) => (
				<Space size="middle">
					<Tooltip title="View Details">
						<EyeOutlined
							style={{ cursor: 'pointer', color: '#1890ff' }}
							onClick={() => {
								console.log('View', record);
								// TODO: Add navigation or modal view
							}}
						/>
					</Tooltip>
					<Tooltip title="Edit">
						<EditOutlined
							style={{ cursor: 'pointer', color: '#52c41a' }}
							onClick={() => {
								console.log('Edit', record);
								// TODO: Add navigation or modal edit
							}}
						/>
					</Tooltip>
				</Space>
			),
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
