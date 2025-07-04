'use client';

import { Layout, Space, Tag, Typography, message } from 'antd';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

import TabNavigation from '@/components/features/admin/CreateNewUser/TabNavigation';
import Header from '@/components/features/lecturer/AssignSupervisor/Header';
import ChecklistToolbar from '@/components/features/lecturer/ChecklistManagement/ChecklistToolbar';
import ImportChecklistExcel from '@/components/features/lecturer/CreateChecklist/ImportChecklistExcel';
import ManualChecklistForm from '@/components/features/lecturer/CreateChecklist/ManualChecklistForm';

export default function CreateChecklist() {
	const searchParams = useSearchParams();

	const defaultSemester = searchParams.get('semester') || '';
	const defaultMilestone = searchParams.get('milestone') || '';

	const [activeTab, setActiveTab] = useState('manual');
	const [semester, setSemester] = useState(defaultSemester);
	const [milestone, setMilestone] = useState(defaultMilestone);
	const disabledSemester = !!defaultSemester;
	const disabledMilestone = !!defaultMilestone;

	const handleAddItem = () => {
		if (!semester || !milestone) {
			message.warning('Please select both semester and milestone');
			return;
		}
		console.log(
			`Add new item for checklist: ${semester}, Milestone: ${milestone}`,
		);
	};

	return (
		<Layout style={{ minHeight: '100vh', background: '#fff', padding: 24 }}>
			<Space direction="vertical" size="large" style={{ width: '100%' }}>
				<Header
					title="Create Checklist"
					description="Start building a checklist manually or import one from an Excel file to streamline the evaluation process."
					badgeText="Moderator Only"
				/>

				{/* Hiển thị context tạo checklist */}
				{semester && milestone && (
					<Typography.Text type="secondary">
						You are creating checklist for: <Tag color="blue">{semester}</Tag>
						<Tag color="purple">{milestone}</Tag>
					</Typography.Text>
				)}

				<TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

				<ChecklistToolbar
					semester={semester}
					onSemesterChange={setSemester}
					milestone={milestone}
					onMilestoneChange={setMilestone}
					onCreate={handleAddItem}
					buttonLabel="Add New Item"
					disabledCreate={false}
					disabledSemester={disabledSemester}
					disabledMilestone={disabledMilestone}
				/>

				{activeTab === 'manual' && <ManualChecklistForm />}
				{activeTab === 'excel' && <ImportChecklistExcel />}
			</Space>
		</Layout>
	);
}
