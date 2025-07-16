'use client';

import { Button, Col, Input, Row, Select, Typography } from 'antd';

import AssignedGroupsTable from '@/components/AssignedGroupsTable';
import DashboardStats from '@/components/DashboardStats';
import MilestonesTimeline from '@/components/MilestonesTimeline';
import MyThesisSection from '@/components/MyThesisSection';

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
