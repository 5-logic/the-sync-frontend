'use client';

import {
	BookOutlined,
	TeamOutlined,
	UserOutlined,
	UsergroupDeleteOutlined,
} from '@ant-design/icons';
import { Col, Row, Skeleton } from 'antd';
import React from 'react';

import StatCard from '@/components/common/Dashboard/StatCard';
import { useDashboardStore } from '@/store';

const DashboardStats: React.FC = () => {
	const { summaryCard, loading, error } = useDashboardStore();

	// Show loading state
	if (loading) {
		return (
			<Row gutter={[16, 16]}>
				{Array.from({ length: 4 }).map((_, index) => (
					<Col xs={24} sm={12} md={6} key={index}>
						<Skeleton.Button
							active
							size="large"
							style={{ width: '100%', height: 120 }}
						/>
					</Col>
				))}
			</Row>
		);
	}

	// Show error or no data state
	if (error || !summaryCard) {
		const defaultStats = [
			{
				title: 'Total Students',
				value: 0,
				icon: <TeamOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
			},
			{
				title: 'Total Lecturers',
				value: 0,
				icon: <UserOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
			},
			{
				title: 'Total Theses',
				value: 0,
				icon: <BookOutlined style={{ fontSize: 24, color: '#fa541c' }} />,
			},
			{
				title: 'Total Groups',
				value: 0,
				icon: (
					<UsergroupDeleteOutlined style={{ fontSize: 24, color: '#722ed1' }} />
				),
			},
		];

		return (
			<Row gutter={[16, 16]}>
				{defaultStats.map((stat) => (
					<Col xs={24} sm={12} md={6} key={stat.title}>
						<StatCard value={stat.value} title={stat.title} icon={stat.icon} />
					</Col>
				))}
			</Row>
		);
	}

	// Map API data to stats
	const stats = [
		{
			title: 'Total Students',
			value: summaryCard.totalStudents,
			icon: <TeamOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
		},
		{
			title: 'Total Lecturers',
			value: summaryCard.totalLecturers,
			icon: <UserOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
		},
		{
			title: 'Total Theses',
			value: summaryCard.totalTheses,
			icon: <BookOutlined style={{ fontSize: 24, color: '#fa541c' }} />,
		},
		{
			title: 'Total Groups',
			value: summaryCard.totalGroups,
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
