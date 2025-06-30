'use client';

import { EyeOutlined } from '@ant-design/icons';
import { Button, Switch, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { TableRowSelection } from 'antd/es/table/interface';
import { useEffect, useMemo, useState } from 'react';

import { TablePagination } from '@/components/common/TablePagination';
import groups from '@/data/group';
import { ExtendedThesis } from '@/data/thesis';

interface Props {
	readonly theses: ExtendedThesis[];
	readonly onSelectionChange?: (selectedIds: string[]) => void;
}

export default function ThesisTable({ theses, onSelectionChange }: Props) {
	const [data, setData] = useState<ExtendedThesis[]>([]);
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const groupMap = useMemo(() => {
		return new Map(groups.map((g) => [g.id, g.name]));
	}, []);

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
			title: 'English Name',
			dataIndex: 'englishName',
			key: 'englishName',
		},
		{
			title: 'Group Name',
			dataIndex: 'groupId',
			key: 'groupName',
			render: (groupId: string) => groupMap.get(groupId) ?? '-',
		},
		{
			title: 'Domain',
			dataIndex: 'domain',
			key: 'domain',
			onFilter: (value, record) => record.domain === value,
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
