'use client';

import { Alert, Button, Space } from 'antd';
import { useState } from 'react';

import { Header } from '@/components/common/Header';
import AssignSupervisorModal from '@/components/features/lecturer/AssignSupervisor/AssignSupervisorModal';
import GroupOverviewTable from '@/components/features/lecturer/AssignSupervisor/GroupOverviewTable';
import { baseColumns } from '@/components/features/lecturer/AssignSupervisor/SupervisorColumns';
import SupervisorFilterBar from '@/components/features/lecturer/AssignSupervisor/SupervisorFilterBar';
import {
	type SupervisorAssignmentData,
	useAssignSupervisor,
} from '@/hooks/lecturer/useAssignSupervisor';

export default function AssignSupervisors() {
	const [search, setSearch] = useState('');
	const [selectedGroup, setSelectedGroup] =
		useState<SupervisorAssignmentData | null>(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [modalLoading, setModalLoading] = useState(false);
	const [statusFilter, setStatusFilter] = useState<
		'All' | 'Finalized' | 'Incomplete' | 'Unassigned'
	>('All');

	const {
		data,
		lecturers,
		loading,
		error,
		assignSupervisor,
		changeSupervisor,
		refreshData,
	} = useAssignSupervisor();

	const filteredData = data.filter((item) => {
		const searchText = search.toLowerCase();
		const matchesSearch = [item.groupName, item.thesisTitle].some((field) =>
			field.toLowerCase().includes(searchText),
		);
		const matchesStatus =
			statusFilter === 'All' || item.status === statusFilter;
		return matchesSearch && matchesStatus;
	});

	const handleAssignSubmit = async (supervisorIds: string[]) => {
		if (!selectedGroup) return;

		setModalLoading(true);
		try {
			let success = false;
			const isChangeMode = selectedGroup.status === 'Finalized';

			if (isChangeMode) {
				const currentSupervisorIds = selectedGroup.supervisorDetails.map(
					(s) => s.id,
				);
				const newSupervisorIds = supervisorIds.filter(Boolean);

				const hasChanges =
					currentSupervisorIds.length !== newSupervisorIds.length ||
					!currentSupervisorIds.every(
						(id, index) => id === newSupervisorIds[index],
					);

				if (hasChanges) {
					for (
						let i = 0;
						i < Math.max(currentSupervisorIds.length, newSupervisorIds.length);
						i++
					) {
						const currentId = currentSupervisorIds[i];
						const newId = newSupervisorIds[i];

						if (currentId && newId && currentId !== newId) {
							success = await changeSupervisor(
								selectedGroup.thesisId,
								currentId,
								newId,
							);
							break;
						}
					}
				} else {
					success = true;
				}
			} else {
				if (supervisorIds.length > 0) {
					success = await assignSupervisor(
						selectedGroup.thesisId,
						supervisorIds[0],
					);

					if (supervisorIds.length > 1) {
						await assignSupervisor(selectedGroup.thesisId, supervisorIds[1]);
					}
				}
			}

			if (success) {
				setModalOpen(false);
				setSelectedGroup(null);

				const { showNotification } = await import('@/lib/utils/notification');
				showNotification.success(
					'Success',
					isChangeMode
						? 'Supervisor changed successfully'
						: 'Supervisor assigned successfully',
				);
			} else {
				const { showNotification } = await import('@/lib/utils/notification');
				showNotification.error(
					'Error',
					isChangeMode
						? 'Failed to change supervisor'
						: 'Failed to assign supervisor',
				);
			}
		} catch (error) {
			console.error('Error in supervisor assignment:', error);
			const { showNotification } = await import('@/lib/utils/notification');
			showNotification.error(
				'Error',
				'An unexpected error occurred. Please try again.',
			);
		} finally {
			setModalLoading(false);
		}
	};

	const columns = [
		...baseColumns,
		{
			title: 'Action',
			render: (_: unknown, record: SupervisorAssignmentData) => (
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

	const lecturerOptions = lecturers.map((lecturer) => ({
		label: lecturer.fullName,
		value: lecturer.id,
	}));

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Header
				title="Assign Supervisor"
				description="Manage supervisor assignments for thesis groups"
				badgeText="Moderator Only"
			/>

			{error && (
				<Alert
					message="Error"
					description={error}
					type="error"
					closable
					onClose={() => window.location.reload()}
					action={
						<Button size="small" onClick={refreshData}>
							Retry
						</Button>
					}
				/>
			)}

			<SupervisorFilterBar
				search={search}
				onSearchChange={setSearch}
				status={statusFilter}
				onStatusChange={setStatusFilter}
			/>

			<GroupOverviewTable
				data={filteredData}
				columns={columns}
				loading={loading}
			/>

			<AssignSupervisorModal
				open={modalOpen}
				loading={modalLoading}
				onCancel={() => {
					setModalOpen(false);
					setSelectedGroup(null);
				}}
				initialValues={selectedGroup?.supervisorDetails.map((s) => s.id) || []}
				onSubmit={handleAssignSubmit}
				lecturerOptions={lecturerOptions}
				isChangeMode={selectedGroup?.status === 'Finalized'}
			/>
		</Space>
	);
}
