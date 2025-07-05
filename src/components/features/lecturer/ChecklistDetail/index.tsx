'use client';

import { Card, Space, Typography } from 'antd';

import Header from '@/components/features/lecturer/AssignSupervisor/Header';
import ChecklistInfoCard from '@/components/features/lecturer/ChecklistDetail/ChecklistInfoCard';
import ChecklistItemsTable from '@/components/features/lecturer/ChecklistDetail/ChecklistItemTable';
import { mockChecklistItems } from '@/data/ChecklistItems';
import { mockChecklists } from '@/data/checklist';

export default function ChecklistDetailPage() {
	const checklistId = 'c1';

	const checklist = mockChecklists.find((cl) => cl.id === checklistId);
	const checklistItems = mockChecklistItems.filter(
		(item) => item.checklistId === checklistId,
	);

	if (!checklist) {
		return <Typography.Text type="danger">Checklist not found</Typography.Text>;
	}

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Header
				title="View Checklist Detail"
				description="Inspect checklist content for a specific milestone and semester, including required fields and criteria."
				badgeText="Moderator Only"
			/>

			<ChecklistInfoCard
				name={checklist.name}
				description={checklist.description ?? undefined}
				semester={checklist.semester}
				milestone={checklist.milestone}
			/>

			<Card title="Checklist">
				<ChecklistItemsTable
					items={checklistItems}
					editable
					onEdit={(item) => console.log('Edit', item)}
				/>
			</Card>
		</Space>
	);
}
