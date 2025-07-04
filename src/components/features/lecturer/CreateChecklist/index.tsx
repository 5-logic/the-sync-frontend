'use client';

import { Layout } from 'antd';
import { useState } from 'react';

import TabNavigation from '@/components/features/admin/CreateNewUser/TabNavigation';
import Header from '@/components/features/lecturer/AssignSupervisor/Header';

import ImportChecklistExcel from './ImportChecklistExcel';

export default function CreateChecklist() {
	const [activeTab, setActiveTab] = useState('manual');

	return (
		<Layout style={{ minHeight: '100vh', background: '#fff' }}>
			<Header
				title="Create Checklist"
				description="Start building a checklist manually or import one from an Excel file to streamline the evaluation process."
				badgeText="Moderator Only"
			/>

			<TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

			{/* {activeTab === 'manual' && <ManualChecklistForm />} */}
			{activeTab === 'excel' && <ImportChecklistExcel />}
		</Layout>
	);
}
