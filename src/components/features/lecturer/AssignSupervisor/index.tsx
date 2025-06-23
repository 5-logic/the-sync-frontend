'use client';

import { Button, Space, Table, Tag } from 'antd';
import { Badge, Col, Row, Typography } from 'antd';
import { useState } from 'react';

import SupervisorFilterBar from '@/components/features/lecturer/AssignSupervisor/SupervisorFilterBar';

const { Title, Text } = Typography;
const mockData = [
	{
		id: '1',
		name: 'Group A',
		englishName: 'AI-powered Healthcare System',
		members: 5,
		supervisors: ['Dr. Sarah Johnson', 'Dr. Davis'],
		status: 'Finalized',
	},
	{
		id: '2',
		name: 'Group B',
		englishName: 'Blockchain Supply Chain',
		members: 5,
		supervisors: ['Dr. Michael Chen', 'Dr. Martinez'],
		status: 'Finalized',
	},
	{
		id: '3',
		name: 'Group C',
		englishName: 'Smart City IoT Platform',
		members: 4,
		supervisors: ['Dr. Emily Wong'],
		status: 'Incomplete',
	},
	{
		id: '4',
		name: 'Group D',
		englishName: 'Cybersecurity Framework',
		members: 5,
		supervisors: [],
		status: 'Unassigned',
	},
];

const statusColorMap: Record<string, string> = {
	Finalized: 'green',
	Incomplete: 'orange',
	Unassigned: 'red',
};

export default function AssignSupervisors() {
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState<
		'All' | 'Finalized' | 'Incomplete' | 'Unassigned'
	>('All');

	const filteredData = mockData.filter((item) => {
		const matchesSearch =
			item.name.toLowerCase().includes(search.toLowerCase()) ||
			item.englishName.toLowerCase().includes(search.toLowerCase());
		const matchesStatus =
			statusFilter === 'All' || item.status === statusFilter;
		return matchesSearch && matchesStatus;
	});

	const columns = [
		{
			title: 'Group Name',
			dataIndex: 'name',
		},
		{
			title: 'Thesis Title',
			dataIndex: 'englishName',
		},
		{
			title: 'Members',
			dataIndex: 'members',
		},
		{
			title: 'Supervisor',
			dataIndex: 'supervisors',
			render: (supervisors: string[]) =>
				supervisors.length > 0 ? (
					<div>
						{supervisors.map((sup) => (
							<div key={sup}>{sup}</div>
						))}
					</div>
				) : (
					'-'
				),
		},
		{
			title: 'Status',
			dataIndex: 'status',
			render: (status: string) => (
				<Tag color={statusColorMap[status]}>{status}</Tag>
			),
		},
		{
			title: 'Action',
			render: (_: unknown, record: (typeof mockData)[number]) => (
				<Button type="primary">
					{record.status === 'Finalized' ? 'Change' : 'Assign'}
				</Button>
			),
		},
	];

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

			<Table
				rowKey="id"
				columns={columns}
				dataSource={filteredData}
				pagination={{
					showTotal: (total, range) =>
						`${range[0]}-${range[1]} of ${total} items`,
					showSizeChanger: true,
					pageSizeOptions: ['10', '20', '50', '100'],
					defaultPageSize: 10,
				}}
				scroll={{ x: 'max-content' }}
			/>
		</Space>
	);
}
