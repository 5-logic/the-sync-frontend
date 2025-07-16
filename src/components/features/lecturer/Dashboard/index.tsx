'use client';

import { Typography } from 'antd';

import { Header } from '@/components/common/Header';
import AssignedGroupsTable from '@/components/features/lecturer/Dashboard/AssignedGroupsTable';
import DashboardStats from '@/components/features/lecturer/Dashboard/DashboardStats';
import MilestonesTimeline from '@/components/features/lecturer/Dashboard/MilestonesTimeline';
import MyThesisSection from '@/components/features/lecturer/Dashboard/MyThesisSection';

const { Title } = Typography;

export default function DashboardPage() {
	return (
		<div style={{ padding: 24 }}>
			<Header
				title="Lecturer Dashboard"
				description="Welcome to your dashboard. Here you can track student progress, manage milestones, and provide timely feedback to guide thesis development."
			/>
			<DashboardStats />

			<div style={{ marginTop: 32 }}>
				<MyThesisSection />
			</div>

			<div style={{ marginTop: 32 }}>
				<AssignedGroupsTable />
			</div>

			<div style={{ marginTop: 32 }}>
				<MilestonesTimeline />
			</div>
		</div>
	);
}
