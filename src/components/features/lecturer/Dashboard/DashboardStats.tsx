import {
	ClockCircleOutlined,
	FileTextOutlined,
	TeamOutlined,
} from '@ant-design/icons';
import { Card, Col, Row } from 'antd';
import React from 'react';

const DashboardStats: React.FC = () => {
	const stats = [
		{
			title: 'Total Thesis Topics',
			value: 12,
			icon: <FileTextOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
		},
		{
			title: 'Active Groups',
			value: 8,
			icon: <TeamOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
		},
		{
			title: 'Pending Milestones',
			value: 5,
			icon: <ClockCircleOutlined style={{ fontSize: 24, color: '#faad14' }} />,
		},
	];

	return (
		<Row gutter={[16, 16]}>
			{stats.map((stat, index) => (
				<Col xs={24} sm={12} md={8} key={index}>
					<Card>
						<div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
							{stat.icon}
							<div>
								<div style={{ fontSize: 24, fontWeight: 600 }}>
									{stat.value}
								</div>
								<div style={{ color: '#888' }}>{stat.title}</div>
							</div>
						</div>
					</Card>
				</Col>
			))}
		</Row>
	);
};

export default DashboardStats;
