'use client';

import { Layout, Space } from 'antd';
import { useState } from 'react';

import TabNavigation from '@/components/features/admin/CreateNewUser/TabNavigation';
import Header from '@/components/features/lecturer/AssignSupervisor/Header';
import ImportChecklistExcel from '@/components/features/lecturer/CreateChecklist/ImportChecklistExcel';
import ManualChecklistForm from '@/components/features/lecturer/CreateChecklist/ManualChecklistForm';

export default function CreateChecklist() {
	const [activeTab, setActiveTab] = useState('manual');

	return (
		<Layout style={{ minHeight: '100vh', background: '#fff', padding: 24 }}>
			<Space direction="vertical" size="large" style={{ width: '100%' }}>
				<Header
					title="Create Checklist"
					description="Start building a checklist manually or import one from an Excel file to streamline the evaluation process."
					badgeText="Moderator Only"
				/>

				<TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

				{activeTab === 'manual' && <ManualChecklistForm />}
				{activeTab === 'excel' && <ImportChecklistExcel />}
			</Space>
		</Layout>
	);
}
