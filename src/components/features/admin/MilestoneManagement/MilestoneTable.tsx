'use client';

import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Table } from 'antd';

import { Milestone } from '@/types/milestone';

type Props = {
	data: Milestone[];
};

export default function MilestoneTable({ data }: Props) {
	const columns = [
		{ title: 'Milestone Name', dataIndex: 'name', key: 'name' },
		{ title: 'Semester Name', dataIndex: 'semester', key: 'semester' },
		{ title: 'Start Date', dataIndex: 'startDate', key: 'startDate' },
		{ title: 'End Date', dataIndex: 'endDate', key: 'endDate' },
		{
			title: 'Actions',
			key: 'actions',
			render: () => (
				<div className="flex gap-2">
					<EditOutlined className="text-yellow-500 cursor-pointer" />
					<DeleteOutlined className="text-red-500 cursor-pointer" />
				</div>
			),
		},
	];

	return (
		<Table
			columns={columns}
			dataSource={data}
			rowKey="key"
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
