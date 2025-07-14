'use client';

import { Space } from 'antd';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { Header } from '@/components/common/Header';
import ChecklistTable from '@/components/features/lecturer/ChecklistManagement/ChecklistTable';
import ChecklistToolbar from '@/components/features/lecturer/ChecklistManagement/ChecklistToolbar';
import { mockChecklistItems } from '@/data/ChecklistItems';
import { mockChecklists } from '@/data/checklist';

export default function ChecklistManagement() {
	const router = useRouter();
	const [semester, setSemester] = useState('');
	const [milestone, setMilestone] = useState('');
	const [searchValue, setSearchValue] = useState('');

	const getTotalItems = (checklistId: string) =>
		mockChecklistItems.filter((item) => item.checklistId === checklistId)
			.length;

	const handleCreateChecklist = () => {
		router.push(`/lecturer/create-checklist`);
	};

	// Lọc theo search + semester + milestone
	const filteredChecklists = useMemo(() => {
		return mockChecklists.filter((item) => {
			const matchesSearch =
				item.name.toLowerCase().includes(searchValue.toLowerCase()) || // NOSONAR
				item.description?.toLowerCase().includes(searchValue.toLowerCase());

			const matchesSemester = semester ? item.semester === semester : true;
			const matchesMilestone = milestone ? item.milestone === milestone : true;

			return matchesSearch && matchesSemester && matchesMilestone;
		});
	}, [searchValue, semester, milestone]);

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
				onSearchChange={setSearchValue}
			/>

			<ChecklistTable data={filteredChecklists} getTotalItems={getTotalItems} />
		</Space>
	);
}
