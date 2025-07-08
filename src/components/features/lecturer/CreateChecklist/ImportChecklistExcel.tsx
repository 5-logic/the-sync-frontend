'use client';

import { Button, Card, Col, Input, Row, Space, Switch, Table } from 'antd';
import { UploadFile } from 'antd/es/upload/interface';
import { useState } from 'react';

import ChecklistCommonHeader from '@/components/features/lecturer/CreateChecklist/ChecklistCommonHeader';
import ChecklistDeleteButton from '@/components/features/lecturer/CreateChecklist/ChecklistDeleteButton';
import ChecklistDragger from '@/components/features/lecturer/CreateChecklist/ChecklistDragger';
import { mockMilestones } from '@/data/milestone';
import { mockSemesters } from '@/data/semester';
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
	const [selectedSemester, setSelectedSemester] = useState<string>('');
	const [selectedMilestone, setSelectedMilestone] = useState<string>('');

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
					checkedChildren="Mandatory"
					unCheckedChildren="Optional"
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
				<ChecklistDeleteButton onDelete={() => handleRemoveItem(record.id)} />
			),
		},
	];

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<ChecklistCommonHeader
				semester={selectedSemester}
				milestone={selectedMilestone}
				checklistName={checklistName}
				checklistDescription={checklistDescription}
				onNameChange={setChecklistName}
				onDescriptionChange={setChecklistDescription}
				onSemesterChange={setSelectedSemester}
				onMilestoneChange={setSelectedMilestone}
				availableSemesters={mockSemesters}
				availableMilestones={mockMilestones}
				showErrors={showErrors}
			/>

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
							rowKey={(item) => item.id}
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
											// Gọi API hoặc xử lý lưu
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
