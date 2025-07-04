'use client';

import { Space, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import Header from '@/components/features/lecturer/AssignSupervisor/Header';
import ChecklistTable from '@/components/features/lecturer/ChecklistManagement/ChecklistTable';
import ChecklistToolbar from '@/components/features/lecturer/ChecklistManagement/ChecklistToolbar';
import { mockChecklistItems } from '@/data/ChecklistItems';
import { mockChecklists } from '@/data/checklist';

export default function ChecklistManagement() {
	const router = useRouter();
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

	// ✅ Kiểm tra nếu đã tồn tại checklist với semester + milestone thì disable
	const checklistExists =
		semester !== '' &&
		milestone !== '' &&
		checklists.some(
			(cl) => cl.semester === semester && cl.milestone === milestone,
		);

	const handleCreateChecklist = () => {
		if (!semester || !milestone) {
			message.warning(
				'Please select both semester and milestone before creating a checklist.',
			);
			return;
		}
		router.push(
			`/admin/checklist/create-checklist?semester=${semester}&milestone=${milestone}`,
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
				disabledCreate={
					!semester || !milestone || checklistExists // 👈 chỉ active khi chưa có checklist cho combo đó
				}
			/>

			<ChecklistTable data={filteredChecklists} getTotalItems={getTotalItems} />
		</Space>
	);
}
