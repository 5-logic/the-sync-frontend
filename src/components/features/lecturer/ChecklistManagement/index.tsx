'use client';

import { Space } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Header } from '@/components/common/Header';
import ChecklistTable from '@/components/features/lecturer/ChecklistManagement/ChecklistTable';
import ChecklistToolbar from '@/components/features/lecturer/ChecklistManagement/ChecklistToolbar';
import { useChecklistStore } from '@/store';

export default function ChecklistManagement() {
	const router = useRouter();

	const {
		filteredChecklists,
		loading,
		fetchChecklists,
		setSearchText,
		setSelectedMilestoneId,
		getTotalItems,
	} = useChecklistStore();

	// Fetch checklists on component mount
	useEffect(() => {
		fetchChecklists();
	}, [fetchChecklists]);

	const handleCreateChecklist = () => {
		router.push(`/lecturer/create-checklist`);
	};

	const handleRefresh = () => {
		fetchChecklists(true); // Force refresh
	};

	const handleSearchChange = (value: string) => {
		setSearchText(value);
	};

	const handleMilestoneChange = (milestoneId: string | null) => {
		setSelectedMilestoneId(milestoneId);
	};

	return (
		<div style={{ padding: '0 4px' }}>
			<Space direction="vertical" size="large" style={{ width: '100%' }}>
				<Header
					title="Checklist Management"
					description="Manage evaluation checklists by thesis phases to ensure consistency, transparency, and progress tracking."
					badgeText="Moderator Only"
				/>

				<ChecklistToolbar
					onCreate={handleCreateChecklist}
					onRefresh={handleRefresh}
					onSearchChange={handleSearchChange}
					onMilestoneChange={handleMilestoneChange}
					loading={loading}
				/>

				<ChecklistTable
					data={filteredChecklists}
					getTotalItems={getTotalItems}
					loading={loading}
				/>
			</Space>
		</div>
	);
}
