'use client';

import { Space, message } from 'antd';
import { useState } from 'react';

import Header from '@/components/features/lecturer/AssignSupervisor/Header';
import ChecklistTable from '@/components/features/lecturer/ChecklistManagement/ChecklistTable';
import ChecklistToolbar from '@/components/features/lecturer/ChecklistManagement/ChecklistToolbar';
import { mockChecklistItems } from '@/data/ChecklistItems';
import { mockChecklists } from '@/data/checklist';

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
