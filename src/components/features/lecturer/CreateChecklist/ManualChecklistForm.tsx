'use client';

import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Input, Row, Space, Switch, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';

import ChecklistContextTitle from '@/components/features/lecturer/CreateChecklist/ChecklistContextTitle';
import { showNotification } from '@/lib/utils';
import type { ChecklistItemCreate } from '@/schemas/checklist';

import ChecklistGeneralInfoForm from './ChecklistGeneralInfoForm';

// Dùng tạm id kiểu string trong UI
type ChecklistItemTemp = ChecklistItemCreate & { id: string };

export default function ManualChecklistForm() {
	const [items, setItems] = useState<ChecklistItemTemp[]>([]);
	const [showErrors, setShowErrors] = useState(false);
	const [checklistName, setChecklistName] = useState('');
	const [checklistDescription, setChecklistDescription] = useState('');

	const handleAddItem = () => {
		const newItem: ChecklistItemTemp = {
			id: Date.now().toString(),
			name: '',
			description: '',
			isRequired: false,
			checklistId: '',
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

	const handleCancel = () => {
		setItems([]);
		setShowErrors(false);
		showNotification.info('Checklist creation cancelled.');
	};

	const handleSaveAll = () => {
		setShowErrors(true);

		if (items.length === 0) {
			showNotification.warning(
				'No items added',
				'Please add at least one checklist item before saving.',
			);
			return;
		}

		const hasEmptyFields = items.some(
			(item) => !item.name.trim() || !item.description?.trim(),
		);

		if (hasEmptyFields) {
			showNotification.warning(
				'Missing Required Fields',
				'Please ensure all checklist items have a name and description.',
			);
			return;
		}

		console.log('Checklist items:', items);
		showNotification.success('Checklist saved successfully!');
		setShowErrors(false);
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
					status={showErrors && !record.name.trim() ? 'error' : undefined}
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
					value={record.description || ''} //NOSONAR
					onChange={(e) =>
						handleChangeItem(record.id, 'description', e.target.value)
					}
					status={
						showErrors && !record.description?.trim() ? 'error' : undefined
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
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			{/* Tiêu đề context (Semester + Milestone) */}
			<ChecklistContextTitle
				semester="Semester2023"
				milestone="Milestone review 2"
				fontSize={16}
			/>

			{/* Thông tin Checklist tổng */}
			<Card title="Checklist Info">
				<ChecklistGeneralInfoForm
					name={checklistName}
					description={checklistDescription}
					onNameChange={setChecklistName}
					onDescriptionChange={setChecklistDescription}
					showErrors={showErrors}
				/>
			</Card>

			{/* Danh sách Checklist Items */}
			<Card
				title="Checklist Items"
				extra={
					<Button
						type="primary"
						icon={<PlusOutlined />}
						onClick={handleAddItem}
					>
						Add New Item
					</Button>
				}
			>
				<Table
					columns={columns}
					dataSource={items}
					rowKey="id"
					pagination={false}
					locale={{ emptyText: 'No checklist items added.' }}
				/>

				{/* Nút Save + Cancel */}
				<Row justify="end" style={{ marginTop: 36 }}>
					<Space style={{ gap: 16 }}>
						<Button onClick={handleCancel}>Cancel</Button>
						<Button type="primary" onClick={handleSaveAll}>
							Save All
						</Button>
					</Space>
				</Row>
			</Card>
		</Space>
	);
}
