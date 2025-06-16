'use client';

import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Space, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { Milestone } from '@/schemas/milestone';

const SEMESTER_MAP: Record<string, string> = {
	'f1234567-aaaa-bbbb-cccc-111111111111': 'Fall 2023',
	's1234567-aaaa-bbbb-cccc-222222222222': 'Spring 2024',
};

type Props = Readonly<{
	data: Milestone[];
}>;

export default function MilestoneTable({ data }: Props) {
	const columns: ColumnsType<Milestone> = [
		{
			title: 'Milestone Name',
			dataIndex: 'name',
			key: 'name',
		},
		{
			title: 'Semester',
			dataIndex: 'semesterId',
			key: 'semesterId',
			render: (semesterId: string) => SEMESTER_MAP[semesterId] ?? 'Unknown',
		},
		{
			title: 'Start Date',
			dataIndex: 'startDate',
			key: 'startDate',
			render: (date: Date) => new Date(date).toLocaleDateString(),
		},
		{
			title: 'End Date',
			dataIndex: 'endDate',
			key: 'endDate',
			render: (date: Date) => new Date(date).toLocaleDateString(),
		},
		{
			title: 'Actions',
			key: 'actions',
			render: () => (
				<Space size="middle">
					<Tooltip title="Edit">
						<Button icon={<EditOutlined />} size="small" type="text" />
					</Tooltip>
					<Tooltip title="Delete">
						<Button icon={<DeleteOutlined />} size="small" danger type="text" />
					</Tooltip>
				</Space>
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
		/>
	);
}
