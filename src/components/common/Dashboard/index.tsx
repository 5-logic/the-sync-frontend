'use client';

import { Col, Row, Space } from 'antd';

import DashboardStats from '@/components/common/Dashboard/DashboardStats';
import { GroupInfo } from '@/components/common/Dashboard/GroupTableInfo';
import { ProgressOverview } from '@/components/common/Dashboard/ProgressOverview';
import SemesterFilter from '@/components/common/Dashboard/SemesterFilter';
import SupervisorLoadChart from '@/components/common/Dashboard/SupervisorLoadChart';
import { Header } from '@/components/common/Header';

export default function Dashboard() {
	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Header
				title="Dashboard"
				description="Welcome to your dashboard. Here you can track student progress, manage milestones, and provide timely feedback to guide thesis development."
				badgeText="Admin & Moderator Only"
			/>
			<SemesterFilter />
			<Row gutter={[16, 16]}>
				<Col span={24}>
					<DashboardStats />
				</Col>
				<Col span={24}>
					<ProgressOverview />
				</Col>
				<Col span={24}>
					<SupervisorLoadChart />
				</Col>
				<Col span={24}>
					<GroupInfo />
				</Col>
			</Row>
		</Space>
	);
}
