'use client';

import { Badge, Button, Col, Row, Space, Typography } from 'antd';
import { useState } from 'react';

import GroupOverviewTable from '@/components/features/lecturer/AssignSupervisor/GroupOverviewTable';
import SupervisorFilterBar from '@/components/features/lecturer/AssignSupervisor/SupervisorFilterBar';
import { extendedGroups } from '@/data/group';

const { Title, Text } = Typography;

export default function AssignSupervisors() {
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState<
		'All' | 'Finalized' | 'Incomplete' | 'Unassigned'
	>('All');

	const filteredData = extendedGroups.filter((item) => {
		const matchesSearch =
			item.name.toLowerCase().includes(search.toLowerCase()) ||
			item.thesisTitle.toLowerCase().includes(search.toLowerCase());
		const matchesStatus =
			statusFilter === 'All' || item.status === statusFilter;
		return matchesSearch && matchesStatus;
	});

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<div className="flex justify-between items-center mb-6">
				<div>
					<Row align="middle" gutter={12} className="mb-2">
						<Col>
							<Title level={2} style={{ marginBottom: 0 }}>
								Assign Supervisor
							</Title>
						</Col>
						<Col>
							<Badge count="Moderator Only" color="gold" />
						</Col>
					</Row>
					<Text type="secondary">
						Manage supervisor assignments for thesis groups
					</Text>
				</div>
			</div>

			<SupervisorFilterBar
				search={search}
				onSearchChange={setSearch}
				status={statusFilter}
				onStatusChange={setStatusFilter}
			/>

			<GroupOverviewTable
				data={filteredData}
				extraColumns={[
					{
						title: 'Action',
						render: (_, record) => (
							<Button type="primary">
								{record.status === 'Finalized' ? 'Change' : 'Assign'}
							</Button>
						),
					},
				]}
			/>
		</Space>
	);
}
