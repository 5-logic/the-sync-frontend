'use client';

import { Layout, Space } from 'antd';
import { useState } from 'react';

import { Header } from '@/components/common/Header';
import TabNavigation from '@/components/features/admin/CreateNewUser/TabNavigation';
import UnifiedChecklistForm from '@/components/features/lecturer/CreateChecklist/ChecklistForm';

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

				{activeTab === 'manual' && <UnifiedChecklistForm mode="manual" />}
				{activeTab === 'excel' && <UnifiedChecklistForm mode="import" />}
			</Space>
		</Layout>
	);
}
