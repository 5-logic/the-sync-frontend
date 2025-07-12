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

	/**
	 * Handle supervisor assignment/change submission
	 *
	 * CHANGE MODE Logic:
	 * - Can change both supervisors at their respective positions
	 * - Supervisor 1 → New Supervisor 1, Supervisor 2 → New Supervisor 2
	 * - Each supervisor change calls separate API
	 * - Maintains position order (no swapping positions)
	 * - Handles adding supervisor 2 if only supervisor 1 existed
	 *
	 * ASSIGN MODE Logic:
	 * - Assign supervisors in the order provided
	 * - Filters out supervisors already assigned to avoid duplicates
	 * - First supervisor is required, second is optional
	 *
	 * DUPLICATE PREVENTION:
	 * - Modal filters available options in assign mode
	 * - Modal prevents selecting same supervisor for both positions
	 * - Backend validation prevents duplicate assignments
	 * - Component logic double-checks before API calls
	 *
	 * NOTIFICATIONS:
	 * - Handled by store (useSupervisionStore) to avoid duplicates
	 * - Component only manages modal state
	 */
	const handleAssignSubmit = async (supervisorIds: string[]) => {
		if (!selectedGroup) return;

		setModalLoading(true);

		const isChangeMode = selectedGroup.status === 'Finalized';
		let success = false;
		if (isChangeMode) {
			const currentSupervisorIds = selectedGroup.supervisorDetails.map(
				(s) => s.id,
			);
			const newSupervisorIds = supervisorIds.filter(Boolean);

			try {
				let allOperationsSuccess = true;
				const operations: Array<{ type: string; success: boolean }> = [];

				// Strategy: Compare each position and determine the needed operation
				const maxLength = Math.max(
					currentSupervisorIds.length,
					newSupervisorIds.length,
				);

				for (let i = 0; i < maxLength; i++) {
					const currentId = currentSupervisorIds[i];
					const newId = newSupervisorIds[i];

					if (currentId && newId && currentId !== newId) {
						// Change supervisor at position i
						const result = await changeSupervisor(
							selectedGroup.thesisId,
							currentId,
							newId,
						);
						operations.push({
							type: `change position ${i + 1}`,
							success: result,
						});
						if (!result) allOperationsSuccess = false;
					} else if (!currentId && newId) {
						// Add new supervisor at position i
						const result = await assignSupervisor(
							selectedGroup.thesisId,
							newId,
						);
						operations.push({ type: `add position ${i + 1}`, success: result });
						if (!result) allOperationsSuccess = false;
					} else if (currentId && !newId) {
						// Remove supervisor at position i
						// Note: Currently no remove API, so we skip this
						// Future: implement removeSupervisor API
						operations.push({
							type: `remove position ${i + 1}`,
							success: true,
						});
					}
					// If currentId === newId, no operation needed (same supervisor)
				}

				// Success if all operations succeeded or if no operations were needed
				success = operations.length === 0 || allOperationsSuccess;

				// Log operations for debugging
				if (operations.length > 0) {
					console.log('Supervisor change operations:', operations);
				}
			} catch (error) {
				console.error('Error in change mode operations:', error);
				success = false;
			}
		} else {
			// Assign mode: assign supervisors in order
			const currentSupervisorIds = selectedGroup.supervisorDetails.map(
				(s) => s.id,
			);

			try {
				let allAssignmentsSuccess = true;
				const assignments: Array<{ supervisor: string; success: boolean }> = [];

				// Filter out supervisors that are already assigned to avoid duplicates
				const supervisorsToAssign = supervisorIds.filter(
					(id) => id && !currentSupervisorIds.includes(id),
				);

				if (supervisorsToAssign.length > 0) {
					// Assign each supervisor sequentially
					for (const supervisorId of supervisorsToAssign) {
						const result = await assignSupervisor(
							selectedGroup.thesisId,
							supervisorId,
						);
						assignments.push({ supervisor: supervisorId, success: result });
						if (!result) {
							allAssignmentsSuccess = false;
							// Continue with other assignments even if one fails
						}
					}

					success = allAssignmentsSuccess;

					// Log assignments for debugging
					console.log('Supervisor assign operations:', assignments);
				} else {
					// All selected supervisors are already assigned
					success = true;
				}
			} catch (error) {
				console.error('Error in assign mode operations:', error);
				success = false;
			}
		}

		if (success) {
			setModalOpen(false);
			setSelectedGroup(null);
			// Notification is handled by the store, no need to show here
		}

		setModalLoading(false);
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
				currentSupervisorIds={
					selectedGroup?.supervisorDetails.map((s) => s.id) || []
				}
			/>
		</Space>
	);
}
