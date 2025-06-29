'use client';

import { Button, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { ExtendedThesis } from '@/data/thesis';

interface Props {
	theses: ExtendedThesis[];
}

export default function ThesisTable({ theses }: Props) {
	const columns: ColumnsType<ExtendedThesis> = [
		{
			title: 'Vietnamese Name',
			dataIndex: 'vietnameseName',
			key: 'vietnameseName',
			ellipsis: false,
			render: (text) => (
				<div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
					{text}
				</div>
			),
		},
		{
			title: 'English Name',
			dataIndex: 'englishName',
			key: 'englishName',
			ellipsis: false,
			render: (text) => (
				<div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
					{text}
				</div>
			),
		},
		{
			title: 'Abbreviation',
			dataIndex: 'abbreviation',
			key: 'abbreviation',
			responsive: ['md'],
		},
		{
			title: 'Group Name',
			dataIndex: ['group', 'id'],
			key: 'groupName',
			render: (_, record) => record.group?.id || 'N/A',
			responsive: ['lg'],
		},
		{
			title: 'Domain',
			dataIndex: 'domain',
			key: 'domain',
			responsive: ['md'],
		},
		{
			title: 'Key Version',
			dataIndex: 'version',
			key: 'version',
			responsive: ['lg'],
		},
		{
			title: 'Status',
			key: 'status',
			render: (_, record) => (
				<Tag color={record.isPublish ? 'green' : 'red'}>
					{record.isPublish ? 'Publish' : 'Unpublish'}
				</Tag>
			),
			responsive: ['sm'],
		},
		{
			title: 'Actions',
			key: 'actions',
			render: (_, record) => (
				<Space>
					<Button type="primary">View Details</Button>
					<Button>{record.isPublish ? 'Unpublish' : 'Publish'}</Button>
				</Space>
			),
		},
	];

	return (
		<Table
			rowKey="id"
			columns={columns}
			dataSource={theses}
			pagination={{ pageSize: 10, showSizeChanger: true }}
			// scroll x sẽ tự hiện khi kích thước màn hình quá nhỏ
			scroll={{ x: '100%' }}
		/>
	);
}
