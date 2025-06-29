'use client';

import { EyeOutlined } from '@ant-design/icons';
import { Button, Switch, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';

import { ExtendedThesis } from '@/data/thesis';

interface Props {
	theses: ExtendedThesis[];
}

export default function ThesisTable({ theses }: Props) {
	const [data, setData] = useState<ExtendedThesis[]>(theses);

	const handleTogglePublish = (id: string, newValue: boolean) => {
		const updated = data.map((item) =>
			item.id === id ? { ...item, isPublish: newValue } : item,
		);
		setData(updated);
		console.log(
			`Thesis ${id} is now ${newValue ? 'Published' : 'Unpublished'}`,
		);
	};

	const columns: ColumnsType<ExtendedThesis> = [
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
			title: 'Status',
			key: 'status',
			render: (_, record) => (
				<Switch
					checked={record.isPublish}
					checkedChildren="Published"
					unCheckedChildren="Unpublished"
					onChange={(checked) => handleTogglePublish(record.id, checked)}
				/>
			),
			responsive: ['sm'],
		},
		{
			title: 'Actions',
			key: 'actions',
			render: (_, record) => (
				<Tooltip title="View Detail">
					<Button
						type="text"
						icon={<EyeOutlined />}
						onClick={() =>
							console.log(`Viewing details for ${record.englishName}`)
						}
					/>
				</Tooltip>
			),
		},
	];

	return (
		<Table
			rowKey="id"
			columns={columns}
			dataSource={data}
			pagination={{ pageSize: 10, showSizeChanger: true }}
			scroll={{ x: '100%' }}
		/>
	);
}
