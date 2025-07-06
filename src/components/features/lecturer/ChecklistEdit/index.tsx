'use client';

import { Button, Card, Row, Space, Typography } from 'antd';
import { useState } from 'react';

import Header from '@/components/features/lecturer/AssignSupervisor/Header';
import ChecklistInfoCard from '@/components/features/lecturer/ChecklistDetail/ChecklistInfoCard';
import ChecklistItemsTable from '@/components/features/lecturer/ChecklistDetail/ChecklistItemTable';
import { mockChecklistItems } from '@/data/ChecklistItems';
import { mockChecklists } from '@/data/checklist';
import { ChecklistItem } from '@/schemas/checklist';

export default function ChecklistEditPage() {
	const checklistId = 'c1';
	const originalChecklist = mockChecklists.find((cl) => cl.id === checklistId);

	const [name, setName] = useState(originalChecklist?.name ?? '');
	const [description, setDescription] = useState(
		originalChecklist?.description ?? '',
	);

	const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(
		mockChecklistItems.filter((item) => item.checklistId === checklistId),
	);

	const handleDeleteItem = (item: ChecklistItem) => {
		setChecklistItems((prev) => prev.filter((i) => i.id !== item.id));
	};

	const handleChangeField = (
		id: string,
		field: keyof ChecklistItem,
		value: string | boolean,
	) => {
		setChecklistItems((prev) =>
			prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
		);
	};

	const handleSave = () => {
		console.log('Saving checklist...', {
			name,
			description,
			items: checklistItems,
		});
	};

	const handleBack = () => {
		console.log('Back to checklist list or detail');
	};

	if (!originalChecklist) {
		return <Typography.Text type="danger">Checklist not found</Typography.Text>;
	}

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Header
				title="Edit Checklist"
				description="Update checklist content, including name, description, and required evaluation items."
				badgeText="Moderator Only"
			/>

			<ChecklistInfoCard
				name={name}
				description={description}
				semester={originalChecklist.semester}
				milestone={originalChecklist.milestone}
				editable
				onNameChange={setName}
				onDescriptionChange={setDescription}
			/>

			<Card title="Checklist Items">
				<ChecklistItemsTable
					items={checklistItems}
					editable
					allowDelete
					onDelete={handleDeleteItem}
					onChangeField={handleChangeField}
				/>
			</Card>

			<Row justify="end">
				<Space>
					<Button onClick={handleBack}>Back</Button>
					<Button type="primary" onClick={handleSave}>
						Save Checklist
					</Button>
				</Space>
			</Row>
		</Space>
	);
}
