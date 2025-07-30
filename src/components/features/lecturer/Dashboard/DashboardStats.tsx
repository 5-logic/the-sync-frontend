import {
	ClockCircleOutlined,
	FileTextOutlined,
	TeamOutlined,
} from '@ant-design/icons';
import { Col, Row } from 'antd';
import React, { useEffect } from 'react';

import StatCard from '@/components/common/Dashboard/StatCard';
import { useCurrentSemester } from '@/hooks';
import { useSessionData } from '@/hooks/auth';
import { useLecturerDashboardStore } from '@/store';

const DashboardStats: React.FC = () => {
	const { session } = useSessionData();
	const { currentSemester } = useCurrentSemester();

	const {
		stats,
		totalThesisLoading,
		activeGroupsLoading,
		pendingMilestonesLoading,
		fetchStats,
	} = useLecturerDashboardStore();

	useEffect(() => {
		if (session?.user?.id && currentSemester?.id) {
			fetchStats(session.user.id, currentSemester.id);
		}
	}, [session?.user?.id, currentSemester?.id, fetchStats]);

	const dashboardStats = [
		{
			title: 'Total Thesis Topics',
			value: stats.totalThesis,
			icon: <FileTextOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
			loading: totalThesisLoading,
		},
		{
			title: 'Active Groups',
			value: stats.activeGroups,
			icon: <TeamOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
			loading: activeGroupsLoading,
		},
		{
			title: 'Pending Milestones',
			value: stats.pendingMilestones,
			icon: <ClockCircleOutlined style={{ fontSize: 24, color: '#faad14' }} />,
			loading: pendingMilestonesLoading,
		},
	];

	return (
		<Row gutter={[16, 16]}>
			{dashboardStats.map((stat) => (
				<Col xs={24} sm={12} md={8} key={stat.title}>
					<StatCard
						value={stat.value}
						title={stat.title}
						icon={stat.icon}
						loading={stat.loading}
					/>
				</Col>
			))}
		</Row>
	);
};

export default DashboardStats;
