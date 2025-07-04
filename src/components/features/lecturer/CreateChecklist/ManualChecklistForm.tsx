'use client';

import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
	Button,
	Card,
	Input,
	Space,
	Switch,
	Table,
	Tooltip,
	Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';

import type { ChecklistItemCreate } from '@/schemas/checklist';

// Dùng tạm id trong UI
type ChecklistItemTemp = ChecklistItemCreate & { id: string };

export default function ManualChecklistForm() {
	const [items, setItems] = useState<ChecklistItemTemp[]>([]);

	const handleAddItem = () => {
		const newItem: ChecklistItemTemp = {
			id: Date.now().toString(),
			name: '',
			description: '',
			isRequired: false,
			checklistId: '', // mặc định rỗng, có thể set sau
		};
		setItems((prev) => [...prev, newItem]);
	};

	const handleRemoveItem = (id: string) => {
		setItems((prev) => prev.filter((item) => item.id !== id));
	};

	const handleChangeItem = (
		id: string,
		field: keyof ChecklistItemCreate,
		value: string | boolean,
	) => {
		setItems((prev) =>
			prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
		);
	};

	const columns: ColumnsType<ChecklistItemTemp> = [
		{
			title: 'Item Name',
			dataIndex: 'name',
			key: 'name',
			render: (_, record) => (
				<Input
					placeholder="Enter item name"
					value={record.name}
					onChange={(e) => handleChangeItem(record.id, 'name', e.target.value)}
				/>
			),
		},
		{
			title: 'Description',
			dataIndex: 'description',
			key: 'description',
			render: (_, record) => (
				<Input
					placeholder="Enter description"
					value={record.description || ''}
					onChange={(e) =>
						handleChangeItem(record.id, 'description', e.target.value)
					}
				/>
			),
		},
		{
			title: 'Required',
			dataIndex: 'isRequired',
			key: 'isRequired',
			width: 100,
			align: 'center',
			render: (_, record) => (
				<Switch
					checked={record.isRequired}
					onChange={(checked) =>
						handleChangeItem(record.id, 'isRequired', checked)
					}
				/>
			),
		},
		{
			title: 'Action',
			key: 'action',
			width: 80,
			align: 'center',
			render: (_, record) => (
				<Tooltip title="Delete">
					<Button
						icon={<DeleteOutlined />}
						danger
						type="text"
						onClick={() => handleRemoveItem(record.id)}
					/>
				</Tooltip>
			),
		},
	];

	return (
		<Space direction="vertical" size="middle" style={{ width: '100%' }}>
			<Card
				title={
					<Space>
						<Typography.Text strong>Manual Checklist Builder</Typography.Text>
						<Button
							type="primary"
							icon={<PlusOutlined />}
							onClick={handleAddItem}
						>
							Add new Item
						</Button>
					</Space>
				}
			>
				<Table
					columns={columns}
					dataSource={items}
					rowKey="id"
					pagination={false}
					locale={{ emptyText: 'No checklist items added.' }}
				/>
			</Card>
		</Space>
	);
}
