'use client';

import { Alert, Button, Space, notification } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import { ConfirmationModal } from '@/components/common/ConfirmModal';
import { Header } from '@/components/common/Header';
import AssignSupervisorModal from '@/components/features/lecturer/AssignSupervisor/AssignSupervisorModal';
import GroupOverviewTable from '@/components/features/lecturer/AssignSupervisor/GroupOverviewTable';
import {
	baseColumns,
	createActionRenderer,
	createSupervisorRenderer,
} from '@/components/features/lecturer/AssignSupervisor/SupervisorColumns';
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
		refreshing,
		updating,
		error,
		refreshData,
		fetchData,
		bulkAssignSupervisors,
		changeSupervisor,
	} = useAssignSupervisor();

	// Manual fetch on component mount
	useEffect(() => {
		// Always try to fetch data, but cache logic in store will determine if API call is needed
		fetchData();
	}, [fetchData]);

	// Draft and bulk assignment stores
	const {
		addDraftAssignment,
		clearAllDrafts,
		getDraftAssignment,
		removeDraftAssignment,
		draftAssignments, // Subscribe to the actual state to trigger re-renders
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

	// Helper function to get draft assignments list from state
	const getDraftsList = () => Object.values(draftAssignments);

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
	 * Handle bulk assignment of all draft assignments using intelligent assignment
	 */
	const handleBulkAssignment = async (): Promise<void> => {
		const drafts = getDraftsList();

		// Filter out drafts for finalized theses
		const validDrafts = drafts.filter((draft) => {
			const thesis = data.find((item) => item.thesisId === draft.thesisId);
			return thesis?.status !== 'Finalized';
		});

		if (validDrafts.length === 0) {
			return;
		}

		// Process each draft using intelligent assignment
		let allSuccessful = true;
		const successfulDrafts: typeof validDrafts = [];

		for (const draft of validDrafts) {
			const thesis = data.find((item) => item.thesisId === draft.thesisId);
			if (!thesis) continue;

			const currentSupervisorIds = thesis.supervisorDetails.map((s) => s.id);
			const newSupervisorIds = draft.lecturerIds;

			const success = await handleIntelligentAssignment(
				currentSupervisorIds,
				newSupervisorIds,
				draft.thesisId,
			);

			if (success) {
				successfulDrafts.push(draft);
			} else {
				allSuccessful = false;
			}
		}

		// Clear only the successful drafts
		successfulDrafts.forEach((draft) => {
			removeDraftAssignment(draft.thesisId);
		});

		// Show notification about results
		if (allSuccessful) {
			notification.success({
				message: 'Success',
				description: `All ${validDrafts.length} assignments completed successfully`,
			});
		} else {
			notification.warning({
				message: 'Partial Success',
				description: `${successfulDrafts.length}/${validDrafts.length} assignments completed successfully`,
			});
		}
	};

	/**
	 * Intelligent supervisor assignment handler
	 * Automatically determines whether to use change or assign API based on the differences
	 */
	const handleIntelligentAssignment = async (
		currentSupervisorIds: string[],
		newSupervisorIds: string[],
		thesisId: string,
	): Promise<boolean> => {
		// If no current supervisors, just use bulk assign
		if (currentSupervisorIds.length === 0) {
			if (newSupervisorIds.length === 0) return true; // No change needed

			const assignments = [{ thesisId, lecturerIds: newSupervisorIds }];
			return await bulkAssignSupervisors(assignments);
		}

		// If no new supervisors, remove all using bulk assign with empty array
		if (newSupervisorIds.length === 0) {
			const assignments = [{ thesisId, lecturerIds: [] }];
			return await bulkAssignSupervisors(assignments);
		}

		// Analyze changes
		const supervisorsToAdd = newSupervisorIds.filter(
			(id) => !currentSupervisorIds.includes(id),
		);
		const supervisorsToRemove = currentSupervisorIds.filter(
			(id) => !newSupervisorIds.includes(id),
		);

		// If no changes needed
		if (supervisorsToAdd.length === 0 && supervisorsToRemove.length === 0) {
			return true;
		}

		try {
			let allSuccessful = true;

			// Handle 1-to-1 supervisor changes first (more efficient)
			const changePairs = Math.min(
				supervisorsToRemove.length,
				supervisorsToAdd.length,
			);

			for (let i = 0; i < changePairs; i++) {
				const currentSupervisorId = supervisorsToRemove[i];
				const newSupervisorId = supervisorsToAdd[i];

				const changeSuccess = await changeSupervisor(
					thesisId,
					currentSupervisorId,
					newSupervisorId,
				);

				if (!changeSuccess) {
					allSuccessful = false;
					break;
				}
			}

			// If all changes were successful and there are remaining additions/removals
			if (
				allSuccessful &&
				(supervisorsToAdd.length !== changePairs ||
					supervisorsToRemove.length !== changePairs)
			) {
				// Use bulk assign to handle remaining changes
				const assignments = [{ thesisId, lecturerIds: newSupervisorIds }];
				const bulkSuccess = await bulkAssignSupervisors(assignments);

				if (!bulkSuccess) {
					allSuccessful = false;
				}
			}

			return allSuccessful;
		} catch (error) {
			console.error('Error in intelligent assignment:', error);
			return false;
		}
	};

	/**
	 * Handle supervisor changes for finalized assignments
	 */
	const handleSupervisorChange = async (
		currentSupervisorIds: string[],
		newSupervisorIds: string[],
		thesisId: string,
	): Promise<boolean> => {
		// Use intelligent assignment for finalized theses
		return await handleIntelligentAssignment(
			currentSupervisorIds,
			newSupervisorIds,
			thesisId,
		);
	};

	/**
	 * Handle assignment mode - add to draft
	 */
	const handleAssignmentMode = (supervisorIds: string[]): void => {
		if (!selectedGroup) return;

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
	};

	/**
	 * Handle save draft action from modal
	 */
	const handleSaveDraft = (supervisorIds: string[]): void => {
		if (!selectedGroup) return;

		// Don't allow drafts for finalized assignments
		if (selectedGroup.status === 'Finalized') {
			return;
		}

		// Don't save empty drafts
		if (supervisorIds.length === 0) {
			setModalOpen(false);
			setSelectedGroup(null);
			return;
		}

		// Always save as draft
		handleAssignmentMode(supervisorIds);
		setModalOpen(false);
		setSelectedGroup(null);
	};

	/**
	 * Handle assign now action from modal (for change cases)
	 */
	const handleAssignNow = async (supervisorIds: string[]): Promise<void> => {
		if (!selectedGroup) return;

		setModalLoading(true);

		try {
			const currentSupervisorIds = selectedGroup.supervisorDetails.map(
				(s) => s.id,
			);
			const newSupervisorIds = supervisorIds.filter(Boolean);

			// This should only be called for change operations
			const success = await handleSupervisorChange(
				currentSupervisorIds,
				newSupervisorIds,
				selectedGroup.thesisId,
			);

			if (success) {
				// Remove draft if it exists after successful assignment
				removeDraftAssignment(selectedGroup.thesisId);
				setModalOpen(false);
				setSelectedGroup(null);
			}
		} catch {
			// Error handling is done in individual functions
		}

		setModalLoading(false);
	};

	/**
	 * Handle single assignment (for non-finalized theses)
	 */
	const handleSingleAssignment = async (
		supervisorIds: string[],
	): Promise<void> => {
		if (!selectedGroup) return;

		setModalLoading(true);

		try {
			const currentSupervisorIds = selectedGroup.supervisorDetails.map(
				(s) => s.id,
			);
			const newSupervisorIds = supervisorIds.filter(Boolean);

			// Use intelligent assignment for all cases
			const success = await handleIntelligentAssignment(
				currentSupervisorIds,
				newSupervisorIds,
				selectedGroup.thesisId,
			);

			if (success) {
				// Remove draft after successful assignment
				removeDraftAssignment(selectedGroup.thesisId);
				setModalOpen(false);
				setSelectedGroup(null);
			}
		} catch {
			// Error handling is done in individual functions
		}

		setModalLoading(false);
	};

	/**
	 * Handle bulk assignment confirmation
	 */
	const handleBulkAssignmentConfirm = (): void => {
		const drafts = getDraftsList();

		// Filter out drafts for finalized theses
		const validDrafts = drafts.filter((draft) => {
			const thesis = data.find((item) => item.thesisId === draft.thesisId);
			return thesis?.status !== 'Finalized';
		});

		ConfirmationModal.show({
			title: 'Assign Supervisors',
			message: `Are you sure you want to assign supervisors for ${validDrafts.length} thesis assignments?`,
			details: `This will assign all pending draft assignments to their respective theses.`,
			note: 'This action cannot be undone. All draft assignments will be processed immediately.',
			noteType: 'danger',
			okText: 'Yes, Assign All',
			cancelText: 'Cancel',
			loading: updating,
			onOk: handleBulkAssignment,
		});
	};

	// Calculate valid draft count (exclude finalized theses)
	const validDraftCount = useMemo(() => {
		const drafts = Object.values(draftAssignments);
		const validCount = drafts.filter((draft) => {
			const thesis = data.find((item) => item.thesisId === draft.thesisId);
			return thesis?.status !== 'Finalized';
		}).length;
		return validCount;
	}, [data, draftAssignments]);

	// Calculate draft count for force re-render
	const draftCount = Object.keys(draftAssignments).length;

	// Memoized columns to prevent unnecessary re-renders
	// Include draftCount to force re-render when drafts change
	const columns = useMemo(() => {
		// Create custom supervisor renderer with draft support
		const supervisorRenderer = createSupervisorRenderer(getDraftAssignment);

		// Create custom action renderer with draft delete support
		const actionRenderer = createActionRenderer(
			(record) => {
				setSelectedGroup(record);
				setModalOpen(true);
			},
			getDraftAssignment,
			removeDraftAssignment,
		);

		// Filter base columns to replace supervisor column
		const baseColumnsWithDrafts = baseColumns.map((column) => {
			if (column.key === 'supervisors') {
				return {
					...column,
					render: supervisorRenderer,
				};
			}
			return column;
		});

		return [
			...baseColumnsWithDrafts,
			{
				title: 'Action',
				key: 'action',
				render: actionRenderer,
			},
		];
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [getDraftAssignment, removeDraftAssignment, validDraftCount, draftCount]);

	const lecturerOptions = useMemo(() => {
		return lecturers.map((lecturer) => ({
			label: lecturer.fullName,
			value: lecturer.id,
		}));
	}, [lecturers]);

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
				onRefresh={refreshData}
				refreshing={refreshing}
				onAssignAllDrafts={handleBulkAssignmentConfirm}
				draftCount={validDraftCount}
				updating={updating}
			/>

			<GroupOverviewTable
				data={filteredData}
				columns={columns}
				loading={loading}
				key={`table-${validDraftCount}-${draftCount}`}
			/>

			<AssignSupervisorModal
				open={modalOpen}
				loading={modalLoading}
				onCancel={() => {
					setModalOpen(false);
					setSelectedGroup(null);
				}}
				initialValues={selectedGroup?.supervisorDetails.map((s) => s.id) || []}
				onSaveDraft={handleSaveDraft}
				onAssignNow={
					selectedGroup?.status === 'Finalized'
						? handleAssignNow
						: handleSingleAssignment
				}
				lecturerOptions={lecturerOptions}
				showAssignNow={true} // Always show assign now button
				isChangeMode={selectedGroup?.status === 'Finalized'}
			/>
		</Space>
	);
}
