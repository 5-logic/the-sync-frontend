'use client';

import { Badge, Card, Col, Row, Space, Typography } from 'antd';

import DashboardStats from './DashboardStats';
import { GroupInfo } from './GroupTableInfo';
import { ProgressOverview } from './ProgressOverview';
import { SupervisorLoadChart } from './SupervisorLoadChart';

const { Title, Paragraph } = Typography;

export default function MorderatorDashboardPage() {
	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Card>
				<Space direction="vertical" size="small" style={{ width: '100%' }}>
					<Space align="center">
						<Title level={2} style={{ margin: 0 }}>
							Dashboard
						</Title>
						<Badge
							count="Moderator Only"
							style={{
								backgroundColor: '#1890ff',
								fontSize: '12px',
								height: '24px',
								lineHeight: '24px',
								borderRadius: '12px',
							}}
						/>
					</Space>
					<Paragraph style={{ margin: 0, color: '#666' }}>
						Welcome to your dashboard. Here you can track student progress,
						manage milestones, and provide timely feedback to guide thesis
						development.
					</Paragraph>
				</Space>
			</Card>
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
