'use client';

import Header from '../AssignSupervisor/Header';
import { Space } from 'antd';
import { useState } from 'react';

import { mockChecklistItems, mockChecklists } from '@/data/checklist';

import ChecklistTable from './ChecklistTable';
import ChecklistToolbar from './ChecklistToolbar';

export default function ChecklistManagement() {
	const [checklists] = useState(mockChecklists);

	const getTotalItems = (checklistId: string) =>
		mockChecklistItems.filter((item) => item.checklistId === checklistId)
			.length;

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Header
				title="Checklist Management"
				description="Manage evaluation checklists by thesis phases to ensure consistency, transparency, and progress tracking."
				badgeText="Moderator Only"
			/>
			<ChecklistToolbar />
			<ChecklistTable data={checklists} getTotalItems={getTotalItems} />
		</Space>
	);
}
