'use client';

import { EditOutlined } from '@ant-design/icons';
import { Switch, Table, Tooltip } from 'antd';
import type { ColumnType } from 'antd/es/table';

import { ChecklistItem } from '@/schemas/checklist';

interface Props {
	items: ChecklistItem[];
	editable?: boolean;
	onEdit?: (item: ChecklistItem) => void;
}

export default function ChecklistItemsTable({
	items,
	editable = false,
	onEdit,
}: Props) {
	const columns: ColumnType<ChecklistItem>[] = [
		{
			title: 'Item Name',
			dataIndex: 'name',
			key: 'name',
		},
		{
			title: 'Description',
			dataIndex: 'description',
			key: 'description',
			render: (text: string | null) => text || <i>No description</i>,
		},
		{
			title: 'Required',
			dataIndex: 'isRequired',
			key: 'isRequired',
			render: (required: boolean) => (
				<Switch
					checked={required}
					disabled={!editable}
					checkedChildren="Mandatory"
					unCheckedChildren="Optional"
				/>
			),
		},
	];

	if (editable) {
		columns.push({
			title: 'Action',
			key: 'action',
			render: (_: unknown, record: ChecklistItem) => (
				<Tooltip title="Edit">
					<EditOutlined
						style={{ color: '#52c41a', cursor: 'pointer' }}
						onClick={() => onEdit?.(record)}
					/>
				</Tooltip>
			),
		});
	}

	return (
		<Table
			rowKey="id"
			dataSource={items}
			columns={columns}
			pagination={false}
		/>
	);
}
