'use client';

import { Space } from 'antd';

import { Header } from '@/components/common/Header';

export default function MorderatorDashboardPage() {
	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Header
				title="Dashboard"
				description="Welcome to your dashboard. Here you can track student progress, manage milestones, and provide timely feedback to guide thesis development."
				badgeText="Moderator Only"
			/>
			<div className="space-y-6">
				<DashboardStats />
				<ProgressOverview />
				<SupervisorLoadChart />
				<GroupTable />
			</div>
		</Space>
	);
}
