'use client';

import { Layout, message } from 'antd';
import { useState } from 'react';

import TabNavigation from '@/components/features/admin/CreateNewUser/TabNavigation';
import Header from '@/components/features/lecturer/AssignSupervisor/Header';
import ChecklistToolbar from '@/components/features/lecturer/ChecklistManagement/ChecklistToolbar';
import ImportChecklistExcel from '@/components/features/lecturer/CreateChecklist/ImportChecklistExcel';

export default function CreateChecklist() {
	const [activeTab, setActiveTab] = useState('manual');
	const [semester, setSemester] = useState('');
	const [milestone, setMilestone] = useState('');

	const handleAddItem = () => {
		if (!semester || !milestone) {
			message.warning('please...');
			return;
		}
		// Đây chỉ là mô phỏng, bạn có thể mở modal tạo checklist tại đây
		console.log(
			`Add new item for checklist: ${semester}, Milestone: ${milestone}`,
		);
	};

	return (
		<Layout style={{ minHeight: '100vh', background: '#fff' }}>
			<Header
				title="Create Checklist"
				description="Start building a checklist manually or import one from an Excel file to streamline the evaluation process."
				badgeText="Moderator Only"
			/>

			<TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

			<ChecklistToolbar
				semester={semester}
				onSemesterChange={setSemester}
				milestone={milestone}
				onMilestoneChange={setMilestone}
				onCreate={handleAddItem}
				buttonLabel="Add New Item"
			/>

			{/* {activeTab === 'manual' && <ManualChecklistForm />} */}
			{activeTab === 'excel' && <ImportChecklistExcel />}
		</Layout>
	);
}
