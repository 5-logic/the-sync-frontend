'use client';

import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Input, Row, Space, Switch, Table } from 'antd';
import { UploadFile } from 'antd/es/upload/interface';
import { useState } from 'react';

import ChecklistCommonHeader from '@/components/features/lecturer/CreateChecklist/ChecklistCommonHeader';
import ChecklistDeleteButton from '@/components/features/lecturer/CreateChecklist/ChecklistDeleteButton';
import ChecklistDragger from '@/components/features/lecturer/CreateChecklist/ChecklistDragger';
import { mockMilestones } from '@/data/milestone';
import { mockSemesters } from '@/data/semester';
import { showNotification } from '@/lib/utils';
import type { ChecklistItemCreate } from '@/schemas/checklist';

// Type dùng chung cho cả Import và Manual Form
interface ChecklistItemTemp extends ChecklistItemCreate {
	readonly id: string;
}

type Mode = 'import' | 'manual';

interface UnifiedChecklistFormProps {
	readonly mode: Mode;
}

export default function UnifiedChecklistForm({
	mode,
}: UnifiedChecklistFormProps) {
	const [items, setItems] = useState<ChecklistItemTemp[]>([]);
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [checklistName, setChecklistName] = useState('');
	const [checklistDescription, setChecklistDescription] = useState('');
	const [showErrors, setShowErrors] = useState(false);
	const [selectedSemester, setSelectedSemester] = useState<string>('');
	const [selectedMilestone, setSelectedMilestone] = useState<string>('');

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
		setFileList([]);
		setShowErrors(false);
		showNotification.info('Checklist action cancelled.');
	};

	const handleSaveAll = () => {
		setShowErrors(true);

		if (!selectedSemester || !selectedMilestone) {
			showNotification.warning(
				'Missing Semester or Milestone',
				'Please select both semester and milestone before saving.',
			);
			return;
		}

		if (!checklistName.trim() || !checklistDescription.trim()) {
			showNotification.warning(
				'Missing Checklist Info',
				'Please provide checklist name and description.',
			);
			return;
		}

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

		console.log('Checklist saved with:', {
			semester: selectedSemester,
			milestone: selectedMilestone,
			name: checklistName,
			description: checklistDescription,
			items,
		});
		showNotification.success('Checklist saved successfully!');
		setShowErrors(false);
	};

	const columns = [
		{
			title: 'Item Name',
			dataIndex: 'name',
			key: 'name',
			render: (_: unknown, record: ChecklistItemTemp) => (
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
			render: (_: unknown, record: ChecklistItemTemp) => (
				<Input
					placeholder="Enter description"
					value={record.description || ''}
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
			align: 'center' as const,
			width: 100,
			render: (_: unknown, record: ChecklistItemTemp) => (
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
			width: 80,
			align: 'center' as const,
			render: (_: unknown, record: ChecklistItemTemp) => (
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

			<Card
				title="Checklist Items"
				extra={
					mode === 'manual' && (
						<Button
							type="primary"
							icon={<PlusOutlined />}
							onClick={handleAddItem}
						>
							Add New Item
						</Button>
					)
				}
			>
				{mode === 'import' && (
					<ChecklistDragger
						fileList={fileList}
						setFileList={setFileList}
						setChecklistItems={(items) =>
							setItems(
								items.map((item, idx) => ({
									...item,
									id: item.id ?? Date.now().toString() + idx,
									checklistId: item.checklistId ?? '',
								})),
							)
						}
					/>
				)}

				{items.length > 0 && (
					<>
						<Table
							columns={columns}
							dataSource={items}
							rowKey="id"
							pagination={false}
							style={{ marginTop: 24 }}
							locale={{ emptyText: 'No checklist items added.' }}
						/>

						<Row justify="end" style={{ marginTop: 36 }}>
							<Space style={{ gap: 16 }}>
								<Button onClick={handleCancel}>Cancel</Button>
								<Button type="primary" onClick={handleSaveAll}>
									{mode === 'manual' ? 'Save All' : 'Import All Checklist'}
								</Button>
							</Space>
						</Row>
					</>
				)}
			</Card>
		</Space>
	);
}
