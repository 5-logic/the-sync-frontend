'use client';

import { DeleteOutlined } from '@ant-design/icons';
import {
	Button,
	Card,
	Col,
	Input,
	Row,
	Space,
	Switch,
	Table,
	Tooltip,
} from 'antd';
import { UploadFile } from 'antd/es/upload/interface';
import { useState } from 'react';

import ChecklistContextTitle from '@/components/features/lecturer/CreateChecklist/ChecklistContextTitle';
import ChecklistDragger from '@/components/features/lecturer/CreateChecklist/ChecklistDragger';
import ChecklistGeneralInfoForm from '@/components/features/lecturer/CreateChecklist/ChecklistGeneral';
import { showNotification } from '@/lib/utils';

export interface ChecklistItem {
	id: string;
	name: string;
	description: string;
	isRequired: boolean;
}

export default function ImportChecklistExcel() {
	const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [checklistName, setChecklistName] = useState('');
	const [checklistDescription, setChecklistDescription] = useState('');
	const [showErrors] = useState(false);

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

	const handleCancel = () => {
		setChecklistItems([]);
		setFileList([]);
		showNotification.info('Checklist import cancelled.');
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

			{/* Import checklist từ Excel */}
			<Card title="Import Checklist Items">
				<ChecklistDragger
					fileList={fileList}
					setFileList={setFileList}
					setChecklistItems={setChecklistItems}
				/>

				{checklistItems.length > 0 && (
					<>
						<Table
							columns={columns}
							dataSource={checklistItems}
							rowKey={(item) => item.name + item.description}
							pagination={false}
							style={{ marginTop: 24 }}
							locale={{ emptyText: 'No checklist items imported.' }}
						/>

						<Row justify="end" style={{ marginTop: 36 }}>
							<Col>
								<Space style={{ gap: 16 }}>
									<Button onClick={handleCancel}>Cancel</Button>
									<Button
										type="primary"
										onClick={() => {
											// TODO: Gọi API hoặc xử lý lưu
											console.log('Imported items:', checklistItems);
										}}
									>
										Import All Checklist
									</Button>
								</Space>
							</Col>
						</Row>
					</>
				)}
			</Card>
		</Space>
	);
}
