'use client';

import { DeleteOutlined } from '@ant-design/icons';
import { Button, Col, Input, Row, Space, Switch, Table, Tooltip } from 'antd';
import { UploadFile } from 'antd/es/upload/interface';
import { useState } from 'react';

import ChecklistDragger from '@/components/features/lecturer/CreateChecklist/ChecklistDragger';

export interface ChecklistItem {
	id: string;
	name: string;
	description: string;
	isRequired: boolean;
}

export default function ImportChecklistExcel() {
	const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
	const [fileList, setFileList] = useState<UploadFile[]>([]);

	const handleRemoveItem = (id: string) => {
		setChecklistItems((prev) => prev.filter((item) => item.id !== id));
	};

	const handleChangeItem = (
		id: string,
		field: keyof ChecklistItem,
		value: unknown,
	) => {
		setChecklistItems((prev) =>
			prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
		);
	};

	const columns = [
		{
			title: 'Item Name',
			dataIndex: 'name',
			key: 'name',
			render: (_: unknown, record: ChecklistItem) => (
				<Input
					value={record.name}
					onChange={(e) => handleChangeItem(record.id, 'name', e.target.value)}
				/>
			),
		},
		{
			title: 'Description',
			dataIndex: 'description',
			key: 'description',
			render: (_: unknown, record: ChecklistItem) => (
				<Input
					value={record.description}
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
			render: (_: unknown, record: ChecklistItem) => (
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
			width: '10%',
			render: (_: unknown, record: ChecklistItem) => (
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
			<ChecklistDragger
				fileList={fileList}
				setFileList={setFileList}
				setChecklistItems={setChecklistItems}
			/>

			{checklistItems.length > 0 && (
				<Space direction="vertical" style={{ width: '100%' }}>
					<Table
						columns={columns}
						dataSource={checklistItems}
						rowKey="id"
						pagination={false}
					/>

					<Row justify="end" gutter={16} style={{ marginTop: 24 }}>
						<Col>
							<Button
								onClick={() => {
									setChecklistItems([]);
									setFileList([]);
								}}
							>
								Cancel
							</Button>
						</Col>
						<Col>
							<Button
								type="primary"
								onClick={() => {
									// Thêm logic gọi API hoặc xử lý tại đây
									console.log('Imported items:', checklistItems);
								}}
							>
								Import All Checklist
							</Button>
						</Col>
					</Row>
				</Space>
			)}
		</Space>
	);
}
