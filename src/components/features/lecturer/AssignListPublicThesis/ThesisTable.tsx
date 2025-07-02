'use client';

import { EyeOutlined } from '@ant-design/icons';
import { Button, Switch, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { TableRowSelection } from 'antd/es/table/interface';
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
	};

	const handleRowSelectionChange = (newSelectedKeys: React.Key[]) => {
		setSelectedRowKeys(newSelectedKeys);
		onSelectionChange?.(newSelectedKeys.map(String));
	};

	const renderSwitch = (record: ExtendedThesis) => (
		<Switch
			checked={record.isPublish}
			checkedChildren="Publish"
			unCheckedChildren="Unpublish"
			onChange={(checked) => handleTogglePublish(record.id, checked)}
		/>
	);

	const renderViewButton = () => (
		<Tooltip title="View Detail">
			<Button type="text" icon={<EyeOutlined />} onClick={() => {}} />
		</Tooltip>
	);

	const columns: ColumnsType<ExtendedThesis> = [
		{
			title: 'English Name',
			dataIndex: 'englishName',
			key: 'englishName',
		},
		{
			title: 'VietNamese Name',
			dataIndex: 'vietnameseName',
			key: 'vietnameseName',
		},
		{
			title: 'Lecturer',
			dataIndex: 'lecturerId',
			key: 'lecturerId',
		},
		{
			title: 'Public Access',
			key: 'publicAccess',
			render: (_, record) => renderSwitch(record),
		},
		{
			title: 'Actions',
			key: 'actions',
			render: () => renderViewButton(),
		},
	];

	const rowSelection: TableRowSelection<ExtendedThesis> = {
		selectedRowKeys,
		onChange: handleRowSelectionChange,
	};

	return (
		<Table
			rowKey="id"
			columns={columns}
			dataSource={data}
			rowSelection={rowSelection}
			pagination={TablePagination}
			scroll={{ x: '100%' }}
		/>
	);
}
