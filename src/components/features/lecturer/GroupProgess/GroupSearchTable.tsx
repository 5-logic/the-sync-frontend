'use client';

import { EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Input, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { TablePagination } from '@/components/common/TablePagination';
import type { FullMockGroup } from '@/data/group';

interface Props {
	data: FullMockGroup[];
	searchText: string;
	onSearchChange: (value: string) => void;
	selectedGroup?: FullMockGroup;
	onGroupSelect: (group: FullMockGroup) => void;
}

export default function GroupSearchTable({
	searchText,
	onSearchChange,
	data,
	selectedGroup,
	onGroupSelect,
}: Readonly<Props>) {
	const columns: ColumnsType<FullMockGroup> = [
		{
			title: 'Group Name',
			dataIndex: 'name',
		},
		{
			title: 'Thesis Code',
			dataIndex: 'code',
		},
		{
			title: 'Thesis Title',
			dataIndex: 'title',
		},
		{
			title: 'Members',
			render: (_, record) => record.members?.length ?? 0,
		},

		{
			title: 'Actions',
			render: (_, record) => (
				<Button
					type="link"
					icon={<EyeOutlined />}
					onClick={() => onGroupSelect(record)}
				/>
			),
		},
	];

	return (
		<Space direction="vertical" size="small" style={{ width: '100%' }}>
			<div style={{ marginBottom: 8 }}>
				<Input
					allowClear
					prefix={<SearchOutlined />}
					placeholder="Search groups or topics"
					value={searchText}
					onChange={(e) => onSearchChange(e.target.value)}
					style={{ width: '100%' }}
				/>
			</div>

			<Table
				columns={columns}
				dataSource={data}
				pagination={TablePagination}
				rowKey="id"
				rowClassName={(record) =>
					record.id === selectedGroup?.id ? 'ant-table-row-selected' : ''
				}
			/>
		</Space>
	);
}
