'use client';

import { Col, Row, Space } from 'antd';

import { Header } from '@/components/common/Header';

import DashboardStats from './DashboardStats';
import { GroupInfo } from './GroupTableInfo';
import { ProgressOverview } from './ProgressOverview';
import { SupervisorLoadChart } from './SupervisorLoadChart';

export default function MorderatorDashboardPage() {
	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Header
				title="Dashboard"
				description="Welcome to your dashboard. Here you can track student progress, manage milestones, and provide timely feedback to guide thesis development."
			/>
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
