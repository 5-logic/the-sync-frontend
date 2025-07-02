'use client';

import { Space } from 'antd';
import { useState } from 'react';

import { mockChecklistItems, mockChecklists } from '@/data/checklist';

import ChecklistHeader from './ChecklistHeader';
import ChecklistTable from './ChecklistTable';
import ChecklistToolbar from './ChecklistToolbar';

export default function ChecklistManager() {
	const [checklists] = useState(mockChecklists);

	const getTotalItems = (checklistId: string) =>
		mockChecklistItems.filter((item) => item.checklistId === checklistId)
			.length;

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<ChecklistHeader />
			<ChecklistToolbar />
			<ChecklistTable data={checklists} getTotalItems={getTotalItems} />
		</Space>
	);
}
