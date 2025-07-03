'use client';

import Header from '../AssignSupervisor/Header';
import { Space, message } from 'antd';
import { useState } from 'react';

import { mockChecklists } from '@/data/checklist';
import { mockChecklistItems } from '@/data/mockChecklistItems';

import ChecklistTable from './ChecklistTable';
import ChecklistToolbar from './ChecklistToolbar';

export default function ChecklistManagement() {
	const [semester, setSemester] = useState('');
	const [milestone, setMilestone] = useState('');
	const [checklists] = useState(mockChecklists);

	const filteredChecklists = checklists.filter((cl) => {
		const matchSemester = semester ? cl.semester === semester : true;
		const matchMilestone = milestone ? cl.milestone === milestone : true;
		return matchSemester && matchMilestone;
	});

	const getTotalItems = (checklistId: string) =>
		mockChecklistItems.filter((item) => item.checklistId === checklistId)
			.length;

	const handleCreateChecklist = () => {
		if (!semester || !milestone) {
			message.warning(
				'Please select both semester and milestone before creating a checklist.',
			);
			return;
		}
		// Đây chỉ là mô phỏng, bạn có thể mở modal tạo checklist tại đây
		console.log(
			`Create checklist for Semester: ${semester}, Milestone: ${milestone}`,
		);
	};

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Header
				title="Checklist Management"
				description="Manage evaluation checklists by thesis phases to ensure consistency, transparency, and progress tracking."
				badgeText="Moderator Only"
			/>

			<ChecklistToolbar
				semester={semester}
				onSemesterChange={setSemester}
				milestone={milestone}
				onMilestoneChange={setMilestone}
				onCreate={handleCreateChecklist}
			/>

			<ChecklistTable data={filteredChecklists} getTotalItems={getTotalItems} />
		</Space>
	);
}
