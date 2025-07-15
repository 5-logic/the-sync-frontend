'use client';

import ProgressOverviewCard from '../../lecturer/GroupProgess/ProgressOverviewCard';
import { Col, Row, Space } from 'antd';

import MilestoneDetailCard from './MilestoneDetailCard';
import MilestoneStep from './MilestoneStep';

export default function ProjectProgressPage() {
	return (
		<Space
			direction="vertical"
			size="large"
			style={{ width: '100%', padding: '16px 24px' }}
		>
			<Row gutter={16}>
				<Col xs={24} lg={16}>
					<MilestoneStep />
					<MilestoneDetailCard />
				</Col>
				<Col xs={24} lg={8}>
					<ProgressOverviewCard />
				</Col>
			</Row>
		</Space>
	);
}
