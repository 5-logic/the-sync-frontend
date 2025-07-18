import { Card, Col, Progress, Row, Space, Typography } from 'antd';
import React from 'react';

import { supervisorLoadData } from '@/data/moderatorStats';

const { Text, Title } = Typography;

const CATEGORY_COLORS: Record<string, string> = {
	'Over Load': '#ff4d4f',
	'High Load': '#faad14',
	'Moderate Load': '#1890ff',
	'Low Load': '#52c41a',
};

const SupervisorLoadChart: React.FC = () => {
	const maxLoad = 5;

	return (
		<Card>
			<Space direction="vertical" size="middle" style={{ width: '100%' }}>
				<Space direction="vertical" size="small" style={{ width: '100%' }}>
					<Title level={4} style={{ margin: 0 }}>
						Supervisor Load Distribution
					</Title>
					<Text type="secondary">
						Number of groups assigned to each supervisor (Max load: 5 groups)
					</Text>
				</Space>

				<Space direction="vertical" size="middle" style={{ width: '100%' }}>
					{supervisorLoadData.map((item, index) => (
						<Row key={index} gutter={[16, 8]} align="middle">
							<Col span={6}>
								<Text strong style={{ fontSize: '14px' }}>
									{item.name}
								</Text>
							</Col>
							<Col span={12}>
								<Progress
									percent={(item.count / maxLoad) * 100}
									strokeColor={CATEGORY_COLORS[item.category]}
									showInfo={false}
									size="small"
								/>
							</Col>
							<Col span={6}>
								<Text style={{ fontSize: '14px' }}>
									{item.count}/{maxLoad} groups
								</Text>
							</Col>
						</Row>
					))}
				</Space>

				<Space wrap style={{ marginTop: 16 }}>
					{Object.entries(CATEGORY_COLORS).map(([label, color]) => (
						<Space key={label} size="small" align="center">
							<div
								style={{
									width: 12,
									height: 12,
									borderRadius: 2,
									backgroundColor: color,
								}}
							/>
							<Text style={{ fontSize: '12px' }}>{label}</Text>
						</Space>
					))}
				</Space>
			</Space>
		</Card>
	);
};

export default SupervisorLoadChart;
