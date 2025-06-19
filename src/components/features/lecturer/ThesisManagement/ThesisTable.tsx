'use client';

import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Space, Table, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { Thesis } from '@/schemas/thesis';

interface Props {
	data: (Thesis & { semesterId?: string; semesterLabel?: string })[];
}

export default function ThesisTable({ data }: Props) {
	const columns: ColumnsType<Props['data'][number]> = [
		{
			title: 'Title',
			dataIndex: 'englishName',
			key: 'title',
			sorter: (a, b) => a.englishName.localeCompare(b.englishName),
		},
		{
			title: 'Semester',
			dataIndex: 'semesterLabel',
			key: 'semester',
			sorter: (a, b) =>
				(a.semesterLabel || '').localeCompare(b.semesterLabel || ''),
		},
		{
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
			render: (status: string) => {
				const colorMap: Record<string, string> = {
					Approved: 'green',
					Pending: 'gold',
					Rejected: 'red',
				};
				return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
			},
		},
		{
			title: 'Summit date',
			dataIndex: 'createdAt',
			key: 'summitDate',
			sorter: (a, b) =>
				new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
			render: (date: Date) => date.toISOString().split('T')[0],
		},
		{
			title: 'Actions',
			key: 'actions',
			render: () => (
				<Space>
					<Tooltip title="Edit">
						<Button icon={<EditOutlined />} type="text" />
					</Tooltip>
					<Tooltip title="View">
						<Button icon={<EyeOutlined />} type="text" />
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
				defaultPageSize: 10,
			}}
			scroll={{ x: 'max-content' }}
		/>
	);
}
