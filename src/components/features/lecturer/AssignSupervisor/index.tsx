'use client';

import { Button, Space } from 'antd';
import { useState } from 'react';

import { Header } from '@/components/common/Header';
import AssignSupervisorModal from '@/components/features/lecturer/AssignSupervisor/AssignSupervisorModal';
import GroupOverviewTable from '@/components/features/lecturer/AssignSupervisor/GroupOverviewTable';
import { baseColumns } from '@/components/features/lecturer/AssignSupervisor/SupervisorColumns';
import SupervisorFilterBar from '@/components/features/lecturer/AssignSupervisor/SupervisorFilterBar';
import { ExtendedGroup, extendedGroups } from '@/data/group';

export default function AssignSupervisors() {
	const [search, setSearch] = useState('');
	const [selectedGroup, setSelectedGroup] = useState<ExtendedGroup | null>(
		null,
	);
	const [modalOpen, setModalOpen] = useState(false);
	const [statusFilter, setStatusFilter] = useState<
		'All' | 'Finalized' | 'Incomplete' | 'Unassigned'
	>('All');

	const filteredData = extendedGroups.filter((item) => {
		const searchText = search.toLowerCase();
		const matchesSearch = [item.name, item.thesisTitle].some((field) =>
			field.toLowerCase().includes(searchText),
		);
		const matchesStatus =
			statusFilter === 'All' || item.status === statusFilter;
		return matchesSearch && matchesStatus;
	});

	const columns = [
		...baseColumns,
		{
			title: 'Action',
			render: (_: unknown, record: ExtendedGroup) => (
				<Button
					type="primary"
					className="w-[80px]"
					onClick={() => {
						setSelectedGroup(record);
						setModalOpen(true);
					}}
				>
					{record?.status === 'Finalized' ? 'Change' : 'Assign'}
				</Button>
			),
		},
	];

	const supervisorOptions = Array.from(
		new Set(
			extendedGroups.flatMap((group) => group.supervisors).filter(Boolean),
		),
	);

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Header
				title="Assign Supervisor"
				description="Manage supervisor assignments for thesis groups"
				badgeText="Moderator Only"
			/>

			<SupervisorFilterBar
				search={search}
				onSearchChange={setSearch}
				status={statusFilter}
				onStatusChange={setStatusFilter}
			/>

			<GroupOverviewTable data={filteredData} columns={columns} />

			<AssignSupervisorModal
				open={modalOpen}
				onCancel={() => {
					setModalOpen(false);
					setSelectedGroup(null);
				}}
				initialValues={selectedGroup?.supervisors}
				onSubmit={() => {
					// xử lý cập nhật tại đây
					setModalOpen(false);
					setSelectedGroup(null);
				}}
				supervisorOptions={supervisorOptions}
			/>
		</Space>
	);
}
