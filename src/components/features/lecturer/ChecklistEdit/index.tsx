'use client';

import ChecklistItemsTable from '../ChecklistDetail/ChecklistItemTable';
import { Card, Input, Space, Typography } from 'antd';
import { useState } from 'react';

import Header from '@/components/features/lecturer/AssignSupervisor/Header';
import { mockChecklistItems } from '@/data/ChecklistItems';
import { mockChecklists } from '@/data/checklist';
import { ChecklistItem } from '@/schemas/checklist';

export default function ChecklistEditPage() {
	const checklistId = 'c1';

	const originalChecklist = mockChecklists.find((cl) => cl.id === checklistId);
	const checklistItems = mockChecklistItems.filter(
		(item) => item.checklistId === checklistId,
	);

	const [name, setName] = useState(originalChecklist?.name || '');
	const [description, setDescription] = useState(
		originalChecklist?.description || '',
	);

	const handleEditItem = (item: ChecklistItem) => {
		console.log('Edit item:', item);
		// Mở modal hoặc drawer ở đây
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

			<Card title="Checklist Info">
				<Space direction="vertical" style={{ width: '100%' }}>
					<Input
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Checklist name"
					/>
					<Input.TextArea
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Checklist description"
						autoSize={{ minRows: 2, maxRows: 5 }}
					/>
					<Typography.Text type="secondary">
						Semester: <b>{originalChecklist.semester}</b> | Milestone:{' '}
						<b>{originalChecklist.milestone}</b>
					</Typography.Text>
				</Space>
			</Card>

			<Card title="Checklist Items">
				<ChecklistItemsTable
					items={checklistItems}
					editable
					onEdit={handleEditItem}
				/>
			</Card>
		</Space>
	);
}
