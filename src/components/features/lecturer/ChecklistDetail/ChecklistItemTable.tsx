'use client';

import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Input, Switch, Table, Tooltip } from 'antd';
import type { ColumnType } from 'antd/es/table';

import { ChecklistItem } from '@/schemas/checklist';

interface Props {
	items: ChecklistItem[];
	editable?: boolean;
	allowEdit?: boolean;
	allowDelete?: boolean;
	onEdit?: (item: ChecklistItem) => void;
	onDelete?: (item: ChecklistItem) => void;
	onChangeField?: (
		id: string,
		field: keyof ChecklistItem,
		value: string | boolean,
	) => void;
}

export default function ChecklistItemsTable({
	items,
	editable = false,
	allowEdit,
	allowDelete,
	onEdit,
	onDelete,
	onChangeField,
}: Props) {
	const columns: ColumnType<ChecklistItem>[] = [
		{
			title: 'Question',
			dataIndex: 'name',
			key: 'name',
			render: (text, record) =>
				editable ? (
					<Input
						value={text}
						onChange={(e) => onChangeField?.(record.id, 'name', e.target.value)}
					/>
				) : (
					text
				),
		},
		{
			title: 'Description',
			dataIndex: 'description',
			key: 'description',
			render: (text, record) =>
				editable ? (
					<Input
						value={text || ''}
						placeholder="No description"
						onChange={(e) =>
							onChangeField?.(record.id, 'description', e.target.value)
						}
					/>
				) : (
					text || <i>No description</i>
				),
		},
		{
			title: 'Required',
			dataIndex: 'isRequired',
			key: 'isRequired',
			render: (required: boolean, record) => (
				<Switch
					checked={required}
					disabled={!editable}
					checkedChildren="Mandatory"
					unCheckedChildren="Optional"
					onChange={(checked) =>
						onChangeField?.(record.id, 'isRequired', checked)
					}
				/>
			),
		},
	];

	// Only show Action column if edit or delete is enabled
	if (allowEdit || allowDelete) {
		columns.push({
			title: 'Action',
			key: 'action',
			width: 100,
			render: (_, record) => (
				<>
					{allowEdit && (
						<Tooltip title="Edit">
							<EditOutlined
								style={{ color: '#1890ff', marginRight: 12, cursor: 'pointer' }}
								onClick={() => onEdit?.(record)}
							/>
						</Tooltip>
					)}

					{allowDelete && (
						<Tooltip title="Delete">
							<DeleteOutlined
								style={{ color: '#ff4d4f', cursor: 'pointer' }}
								onClick={() => onDelete?.(record)}
							/>
						</Tooltip>
					)}
				</>
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
