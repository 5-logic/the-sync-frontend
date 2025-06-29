'use client';

import { EyeOutlined } from '@ant-design/icons';
import { Button, Checkbox, Switch, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';

import { TablePagination } from '@/components/common/TablePagination';
import { ExtendedThesis } from '@/data/thesis';

interface Props {
	readonly theses: ExtendedThesis[];
	readonly onSelectionChange?: (selectedIds: string[]) => void;
}

export default function ThesisTable({ theses, onSelectionChange }: Props) {
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

	const handleCheckboxChange = (id: string, checked: boolean) => {
		setSelectedRowKeys((prev) => {
			const newSelected = checked
				? [...prev, id]
				: prev.filter((key) => key !== id);
			onSelectionChange?.(newSelected.map(String)); // Gọi prop callback
			return newSelected;
		});
	};

	const renderCheckbox = (record: ExtendedThesis) => (
		<Checkbox
			checked={selectedRowKeys.includes(record.id)}
			onChange={(e) => handleCheckboxChange(record.id, e.target.checked)}
		/>
	);

	const renderSwitch = (record: ExtendedThesis) => (
		<Switch
			checked={record.isPublish}
			checkedChildren="Publish"
			unCheckedChildren="Unpublish"
			onChange={(checked) => handleTogglePublish(record.id, checked)}
		/>
	);

	const renderViewButton = (record: ExtendedThesis) => (
		<Tooltip title="View Detail">
			<Button
				type="text"
				icon={<EyeOutlined />}
				onClick={() => console.log(`Viewing details for ${record.englishName}`)}
			/>
		</Tooltip>
	);

	const columns: ColumnsType<ExtendedThesis> = [
		{
			title: 'Select',
			dataIndex: 'select',
			key: 'select',
			render: (_, record) => renderCheckbox(record),
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
			render: (_, record) => renderSwitch(record),
		},
		{
			title: 'Actions',
			key: 'actions',
			render: (_, record) => renderViewButton(record),
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
