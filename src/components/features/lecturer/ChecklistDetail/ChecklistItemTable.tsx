'use client';

import { DeleteOutlined } from '@ant-design/icons';
import { Input, Switch, Table, Tag, Tooltip } from 'antd';
import type { ColumnType } from 'antd/es/table';

import { formatDate } from '@/lib/utils/dateFormat';
import { ChecklistItem } from '@/schemas/checklist';

interface Props {
	items: ChecklistItem[];
	editable?: boolean;
	loading?: boolean;
	onChangeField?: (
		id: string,
		field: keyof ChecklistItem,
		value: string | boolean,
	) => void;
	onDelete?: (item: ChecklistItem) => void;
}

const priorityColorMap = {
	Mandatory: 'red',
	Optional: 'blue',
};

const getEditableColumns = (
	onChangeField?: Props['onChangeField'],
	onDelete?: Props['onDelete'],
	loading?: boolean,
): ColumnType<ChecklistItem>[] => [
	{
		title: 'Question',
		dataIndex: 'name',
		key: 'name',
		render: (text, record) => (
			<Input
				placeholder="Enter item name"
				value={text?.trim() === '' ? '' : text || ''}
				onChange={(e) => onChangeField?.(record.id, 'name', e.target.value)}
				disabled={loading}
			/>
		),
	},
	{
		title: 'Description',
		dataIndex: 'description',
		key: 'description',
		render: (text, record) => (
			<Input
				placeholder="Enter description"
				value={text ?? ''}
				onChange={(e) =>
					onChangeField?.(record.id, 'description', e.target.value)
				}
				disabled={loading}
			/>
		),
	},
	{
		title: 'Priority',
		key: 'priority',
		align: 'center' as const,
		width: 120,
		render: (_, record) => (
			<Switch
				checked={record.isRequired}
				checkedChildren="Mandatory"
				unCheckedChildren="Optional"
				onChange={(checked) =>
					onChangeField?.(record.id, 'isRequired', checked)
				}
				disabled={loading}
			/>
		),
	},
	{
		title: 'Action',
		key: 'action',
		width: 80,
		align: 'center' as const,
		render: (_, record) => (
			<Tooltip title="Delete">
				<DeleteOutlined
					style={{
						color: loading ? '#d9d9d9' : '#ff4d4f',
						cursor: loading ? 'not-allowed' : 'pointer',
					}}
					onClick={() => !loading && onDelete?.(record)}
				/>
			</Tooltip>
		),
	},
];

const getViewColumns = (): ColumnType<ChecklistItem>[] => {
	const columns: ColumnType<ChecklistItem>[] = [
		{
			title: 'Question',
			dataIndex: 'name',
			key: 'name',
		},
		{
			title: 'Description',
			dataIndex: 'description',
			key: 'description',
			render: (text) => text ?? <i>No description</i>,
		},
		{
			title: 'Priority',
			key: 'priority',
			render: (_, record) => {
				const label = record.isRequired ? 'Mandatory' : 'Optional';
				const color = priorityColorMap[label];
				return <Tag color={color}>{label}</Tag>;
			},
		},
		{
			title: 'Created At',
			dataIndex: 'createdAt',
			key: 'createdAt',
			render: (value: Date) => formatDate(value),
		},
		{
			title: 'Updated At',
			dataIndex: 'updatedAt',
			key: 'updatedAt',
			render: (value: Date) => formatDate(value),
		},
	];

	return columns;
};

export default function ChecklistItemsTable({
	items,
	editable = false,
	loading = false,
	onDelete,
	onChangeField,
}: Readonly<Props>) {
	const columns = editable
		? getEditableColumns(onChangeField, onDelete, loading)
		: getViewColumns();

	return (
		<Table
			rowKey="id"
			dataSource={items}
			columns={columns}
			pagination={false}
			loading={loading}
		/>
	);
}
