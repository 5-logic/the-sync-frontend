'use client';

import {
	BookOutlined,
	TeamOutlined,
	UserOutlined,
	UsergroupDeleteOutlined,
} from '@ant-design/icons';
import { Col, Row } from 'antd';
import React from 'react';

import StatCard from '@/components/common/Dashboard/StatCard';

const DashboardStats: React.FC = () => {
	const stats = [
		{
			title: 'Total Students',
			value: 248,
			icon: <TeamOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
		},
		{
			title: 'Total Supervisors',
			value: 32,
			icon: <UserOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
		},
		{
			title: 'Registered Topics',
			value: 156,
			icon: <BookOutlined style={{ fontSize: 24, color: '#fa541c' }} />,
		},
		{
			title: 'Active Groups',
			value: 45,
			icon: (
				<UsergroupDeleteOutlined style={{ fontSize: 24, color: '#722ed1' }} />
			),
		},
	];

	return (
		<Row gutter={[16, 16]}>
			{stats.map((stat) => (
				<Col xs={24} sm={12} md={6} key={stat.title}>
					<StatCard value={stat.value} title={stat.title} icon={stat.icon} />
				</Col>
			))}
		</Row>
	);
};

export default DashboardStats;
