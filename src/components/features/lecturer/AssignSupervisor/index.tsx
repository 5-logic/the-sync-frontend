'use client';

import { Alert, Button, Space } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import { ConfirmationModal } from '@/components/common/ConfirmModal';
import { Header } from '@/components/common/Header';
import AssignSupervisorModal from '@/components/features/lecturer/AssignSupervisor/AssignSupervisorModal';
import DraftAssignmentsList from '@/components/features/lecturer/AssignSupervisor/DraftAssignmentsList';
import GroupOverviewTable from '@/components/features/lecturer/AssignSupervisor/GroupOverviewTable';
import { baseColumns } from '@/components/features/lecturer/AssignSupervisor/SupervisorColumns';
import SupervisorFilterBar from '@/components/features/lecturer/AssignSupervisor/SupervisorFilterBar';
import { useAssignSupervisor } from '@/hooks/lecturer/useAssignSupervisor';
import { type SupervisorAssignmentData } from '@/store/useAssignSupervisorStore';
import { useDraftAssignmentStore } from '@/store/useDraftAssignmentStore';

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
		updating,
		error,
		changeSupervisor,
		refreshData,
		bulkAssignSupervisors,
	} = useAssignSupervisor();

	// Draft and bulk assignment stores
	const {
		addDraftAssignment,
		getDraftAssignmentsList,
		getDraftCount,
		clearAllDrafts,
	} = useDraftAssignmentStore();

	// Clear drafts on page reload or navigation
	useEffect(() => {
		const handleBeforeUnload = () => {
			clearAllDrafts();
		};

		const handlePageHide = () => {
			clearAllDrafts();
		};

		window.addEventListener('beforeunload', handleBeforeUnload);
		window.addEventListener('pagehide', handlePageHide);

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
			window.removeEventListener('pagehide', handlePageHide);
		};
	}, [clearAllDrafts]);

	const filteredData = useMemo(() => {
		return data.filter((item) => {
			const searchText = search.toLowerCase();
			const matchesSearch = [item.groupName, item.thesisTitle].some((field) =>
				field.toLowerCase().includes(searchText),
			);
			const matchesStatus =
				statusFilter === 'All' || item.status === statusFilter;
			return matchesSearch && matchesStatus;
		});
	}, [data, search, statusFilter]);

	/**
	 * Handle bulk assignment of all draft assignments
	 */
	const handleBulkAssignment = async (): Promise<void> => {
		const drafts = getDraftAssignmentsList();

		if (drafts.length === 0) {
			return;
		}

		const assignments = drafts.map((draft) => ({
			thesisId: draft.thesisId,
			lecturerIds: draft.lecturerIds,
		}));

		const result = await bulkAssignSupervisors(assignments);

		if (result) {
			// Clear all drafts after successful assignment
			clearAllDrafts();
			// No need to refresh data - optimistic updates already applied
		}
	};

	/**
	 * Handle supervisor assignment/change submission for individual thesis
	 */
	const handleAssignSubmit = async (supervisorIds: string[]): Promise<void> => {
		if (!selectedGroup) return;

		setModalLoading(true);

		const isChangeMode = selectedGroup.status === 'Finalized';

		if (isChangeMode) {
			// Handle change mode - use existing change supervisor logic
			const currentSupervisorIds = selectedGroup.supervisorDetails.map(
				(s) => s.id,
			);
			const newSupervisorIds = supervisorIds.filter(Boolean);

			let success = false;
			try {
				const maxLength = Math.max(
					currentSupervisorIds.length,
					newSupervisorIds.length,
				);

				for (let i = 0; i < maxLength; i++) {
					const currentId = currentSupervisorIds[i];
					const newId = newSupervisorIds[i];

					if (currentId && newId && currentId !== newId) {
						// Change supervisor at position
						const result = await changeSupervisor(
							selectedGroup.thesisId,
							currentId,
							newId,
						);
						if (!result) {
							success = false;
							break;
						}
						success = true;
					}
				}

				if (success) {
					setModalOpen(false);
					setSelectedGroup(null);
					// No need to refresh data - optimistic updates already applied
				}
			} catch {
				// Error in change mode operations - handled by the hook
			}
		} else {
			// Handle assign mode - add to draft
			const lecturerNames = supervisorIds
				.map((id) => lecturers.find((l) => l.id === id)?.fullName)
				.filter(Boolean) as string[];

			addDraftAssignment({
				thesisId: selectedGroup.thesisId,
				thesisTitle: selectedGroup.thesisTitle,
				groupName: selectedGroup.groupName,
				lecturerIds: supervisorIds,
				lecturerNames,
			});

			setModalOpen(false);
			setSelectedGroup(null);
		}

		setModalLoading(false);
	};

	/**
	 * Handle bulk assignment confirmation
	 */
	const handleBulkAssignmentConfirm = (): void => {
		const drafts = getDraftAssignmentsList();

		ConfirmationModal.show({
			title: 'Assign Supervisors',
			message: `Are you sure you want to assign supervisors for ${drafts.length} thesis assignments?`,
			details: `This will assign all pending draft assignments to their respective theses.`,
			note: 'This action cannot be undone. All draft assignments will be processed immediately.',
			noteType: 'danger',
			okText: 'Yes, Assign All',
			cancelText: 'Cancel',
			loading: updating,
			onOk: handleBulkAssignment,
		});
	};

	const draftCount = getDraftCount();

	// Memoized columns to prevent unnecessary re-renders
	const columns = useMemo(
		() => [
			...baseColumns,
			{
				title: 'Action',
				key: 'action',
				render: (_: unknown, record: SupervisorAssignmentData) => {
					const isFinalized = record.status === 'Finalized';

					return (
						<Button
							type="primary"
							size="small"
							onClick={() => {
								setSelectedGroup(record);
								setModalOpen(true);
							}}
						>
							{isFinalized ? 'Change' : 'Assign'}
						</Button>
					);
				},
			},
		],
		[],
	);

	const lecturerOptions = useMemo(() => {
		return lecturers.map((lecturer) => ({
			label: lecturer.fullName,
			value: lecturer.id,
		}));
	}, [lecturers]);

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
				}}
			>
				<Header
					title="Assign Supervisor"
					description="Manage supervisor assignments for thesis groups"
					badgeText="Moderator Only"
				/>

				{draftCount > 0 && (
					<Button
						type="primary"
						loading={updating}
						disabled={updating}
						onClick={handleBulkAssignmentConfirm}
						style={{ color: 'white' }}
					>
						Assign All Drafts ({draftCount})
					</Button>
				)}
			</div>

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

			<DraftAssignmentsList visible={draftCount > 0} />

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
