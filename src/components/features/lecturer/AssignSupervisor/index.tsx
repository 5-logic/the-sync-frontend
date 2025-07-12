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

/**
 * Main component for assigning supervisors to thesis groups
 */

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
	 * Process a single supervisor operation in change mode
	 */
	const processSupervisorOperation = async (
		currentId: string | undefined,
		newId: string | undefined,
		position: number,
		thesisId: string,
	): Promise<{ type: string; success: boolean }> => {
		if (currentId && newId && currentId !== newId) {
			// Change supervisor at position
			const result = await changeSupervisor(thesisId, currentId, newId);
			return { type: `change position ${position + 1}`, success: result };
		}

		if (!currentId && newId) {
			// Add new supervisor at position
			const result = await assignSupervisor(thesisId, newId);
			return { type: `add position ${position + 1}`, success: result };
		}

		if (currentId && !newId) {
			// Remove supervisor at position (placeholder for future implementation)
			return { type: `remove position ${position + 1}`, success: true };
		}

		// No operation needed
		return { type: `no change position ${position + 1}`, success: true };
	};

	/**
	 * Handle supervisor changes in change mode
	 */
	const handleChangeModeOperations = async (
		currentSupervisorIds: string[],
		newSupervisorIds: string[],
		thesisId: string,
	): Promise<boolean> => {
		try {
			const maxLength = Math.max(
				currentSupervisorIds.length,
				newSupervisorIds.length,
			);
			const operations = [];

			for (let i = 0; i < maxLength; i++) {
				const operation = await processSupervisorOperation(
					currentSupervisorIds[i],
					newSupervisorIds[i],
					i,
					thesisId,
				);
				operations.push(operation);
			}

			return operations.length === 0 || operations.every((op) => op.success);
		} catch (error) {
			console.error('Error in change mode operations:', error);
			return false;
		}
	};

	/**
	 * Handle supervisor assignments in assign mode
	 */
	const handleAssignModeOperations = async (
		supervisorIds: string[],
		currentSupervisorIds: string[],
		thesisId: string,
	): Promise<boolean> => {
		try {
			const supervisorsToAssign = supervisorIds.filter(
				(id) => id && !currentSupervisorIds.includes(id),
			);

			if (supervisorsToAssign.length === 0) {
				return true; // All selected supervisors are already assigned
			}

			const results = await Promise.all(
				supervisorsToAssign.map(async (supervisorId) => {
					const result = await assignSupervisor(thesisId, supervisorId);
					return { supervisor: supervisorId, success: result };
				}),
			);

			return results.every((result) => result.success);
		} catch (error) {
			console.error('Error in assign mode operations:', error);
			return false;
		}
	};

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
		const currentSupervisorIds = selectedGroup.supervisorDetails.map(
			(s) => s.id,
		);

		let success = false;

		if (isChangeMode) {
			const newSupervisorIds = supervisorIds.filter(Boolean);
			success = await handleChangeModeOperations(
				currentSupervisorIds,
				newSupervisorIds,
				selectedGroup.thesisId,
			);
		} else {
			success = await handleAssignModeOperations(
				supervisorIds,
				currentSupervisorIds,
				selectedGroup.thesisId,
			);
		}

		if (success) {
			setModalOpen(false);
			setSelectedGroup(null);
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
			/>
		</Space>
	);
}
