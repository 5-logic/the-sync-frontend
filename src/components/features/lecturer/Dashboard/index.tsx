'use client';

import { Typography } from 'antd';

import AssignedGroupsTable from './AssignedGroupsTable';
import DashboardStats from './DashboardStats';
import MilestonesTimeline from './MilestonesTimeline';
import MyThesisSection from './MyThesisSection';

const { Title } = Typography;

export default function DashboardPage() {
	return (
		<div style={{ padding: 24 }}>
			<Title level={3}>Dashboard</Title>
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
