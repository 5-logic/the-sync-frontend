'use client';

import { EyeOutlined } from '@ant-design/icons';
import { Button, Checkbox, Switch, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';

import { TablePagination } from '@/components/common/TablePagination';
import { ExtendedThesis } from '@/data/thesis';

interface Props {
	theses: ExtendedThesis[];
	onSelectionChange?: (selectedIds: string[]) => void;
}

export default function ThesisTable({ theses }: Props) {
	const [data, setData] = useState<ExtendedThesis[]>([]);
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

	useEffect(() => {
		setData(theses);
	}, [theses]);

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
			title: 'Select',
			dataIndex: 'select',
			key: 'select',
			render: (_, record) => (
				<Checkbox
					checked={selectedRowKeys.includes(record.id)}
					onChange={(e) => {
						const checked = e.target.checked;
						setSelectedRowKeys((prev) =>
							checked
								? [...prev, record.id]
								: prev.filter((id) => id !== record.id),
						);
					}}
				/>
			),
			width: 70,
		},
		{
			title: 'English Name',
			dataIndex: 'englishName',
			key: 'englishName',
		},
		{
			title: 'Vietnamese Name',
			dataIndex: 'vietnameseName',
			key: 'vietnameseName',
		},
		{
			title: 'Abbreviation',
			dataIndex: 'abbreviation',
			key: 'abbreviation',
		},
		{
			title: 'Public Access',
			key: 'publicAccess',
			render: (_, record) => (
				<Switch
					checked={record.isPublish}
					checkedChildren="Publish"
					unCheckedChildren="Unpublish"
					onChange={(checked) => handleTogglePublish(record.id, checked)}
				/>
			),
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
			pagination={TablePagination}
			scroll={{ x: '100%' }}
		/>
	);
}
