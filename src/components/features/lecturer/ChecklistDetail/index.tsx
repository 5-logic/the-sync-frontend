'use client';

import { Button, Card, Row, Space, Typography } from 'antd';
import { useState } from 'react';

import Header from '@/components/features/lecturer/AssignSupervisor/Header';
import ChecklistInfoCard from '@/components/features/lecturer/ChecklistDetail/ChecklistInfoCard';
import ChecklistItemsTable from '@/components/features/lecturer/ChecklistDetail/ChecklistItemTable';
import { mockChecklistItems } from '@/data/ChecklistItems';
import { mockChecklists } from '@/data/checklist';
import { ChecklistItem } from '@/schemas/checklist';

export default function ChecklistDetailPage() {
	const checklistId = 'c1';
	const checklist = mockChecklists.find((cl) => cl.id === checklistId);

	const [checklistItems] = useState<ChecklistItem[]>(
		mockChecklistItems.filter((item) => item.checklistId === checklistId),
	);

	if (!checklist) {
		return <Typography.Text type="danger">Checklist not found</Typography.Text>;
	}
	const handleBack = () => {
		console.log('Back to checklist list or detail');
	};

	const handleEdit = () => {
		console.log('Edit Checklist', checklist.id);
	};

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Header
				title="Checklist Detail"
				description="Inspect checklist content for a specific milestone and semester, including required fields and criteria."
				badgeText="Moderator Only"
			/>

			<ChecklistInfoCard
				name={checklist.name}
				description={checklist.description ?? undefined}
				semester={checklist.semester}
				milestone={checklist.milestone}
			/>

			<Card title="Checklist Items">
				<ChecklistItemsTable items={checklistItems} />
			</Card>
			<Row justify="end">
				<Space size="middle">
					{' '}
					<Button onClick={handleBack}>Back</Button>
					<Button type="primary" onClick={handleEdit}>
						Edit
					</Button>
				</Space>
			</Row>
		</Space>
	);
}
