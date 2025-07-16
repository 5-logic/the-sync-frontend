'use client';

import { Alert, Button, Space } from 'antd';
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
		changeSupervisor,
		refreshData,
		fetchData,
		bulkAssignSupervisors,
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
	 * Handle bulk assignment of all draft assignments
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

		const assignments = validDrafts.map((draft) => ({
			thesisId: draft.thesisId,
			lecturerIds: draft.lecturerIds,
		}));

		const result = await bulkAssignSupervisors(assignments);

		if (result) {
			// Clear only the valid drafts after successful assignment
			validDrafts.forEach((draft) => {
				removeDraftAssignment(draft.thesisId);
			});
			// No need to refresh data - optimistic updates already applied
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
		const maxLength = Math.max(
			currentSupervisorIds.length,
			newSupervisorIds.length,
		);

		for (let i = 0; i < maxLength; i++) {
			const currentId = currentSupervisorIds[i];
			const newId = newSupervisorIds[i];

			if (currentId && newId && currentId !== newId) {
				const result = await changeSupervisor(thesisId, currentId, newId);
				if (!result) {
					return false;
				}
			}
		}
		return true;
	};

	/**
	 * Handle assignment mode - add to draft
	 */
	const handleAssignmentMode = (supervisorIds: string[]): void => {
		console.log('🔥 handleAssignmentMode called with:', supervisorIds);
		console.log('🔥 selectedGroup in handleAssignmentMode:', selectedGroup);

		if (!selectedGroup) return;

		const lecturerNames = supervisorIds
			.map((id) => lecturers.find((l) => l.id === id)?.fullName)
			.filter(Boolean) as string[];

		console.log('🔥 lecturerNames mapped:', lecturerNames);
		console.log('🔥 About to call addDraftAssignment with:', {
			thesisId: selectedGroup.thesisId,
			thesisTitle: selectedGroup.thesisTitle,
			groupName: selectedGroup.groupName,
			lecturerIds: supervisorIds,
			lecturerNames,
		});
		addDraftAssignment({
			thesisId: selectedGroup.thesisId,
			thesisTitle: selectedGroup.thesisTitle,
			groupName: selectedGroup.groupName,
			lecturerIds: supervisorIds,
			lecturerNames,
		});

		console.log('🔥 addDraftAssignment called successfully');
		console.log('🔥 Current draftAssignments after save:', draftAssignments);
		console.log('🔥 Current validDraftCount after save:', validDraftCount);
	};

	/**
	 * Handle save draft action from modal
	 */
	const handleSaveDraft = (supervisorIds: string[]): void => {
		console.log('🔥 handleSaveDraft called with:', supervisorIds);
		console.log('🔥 selectedGroup:', selectedGroup);

		if (!selectedGroup) return;

		// Don't allow drafts for finalized assignments
		if (selectedGroup.status === 'Finalized') {
			console.warn('Cannot create draft for finalized assignment');
			return;
		}

		// Don't save empty drafts
		if (supervisorIds.length === 0) {
			console.warn('Cannot save empty draft');
			setModalOpen(false);
			setSelectedGroup(null);
			return;
		}

		console.log('🔥 About to call handleAssignmentMode');
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
		return drafts.filter((draft) => {
			const thesis = data.find((item) => item.thesisId === draft.thesisId);
			return thesis?.status !== 'Finalized';
		}).length;
	}, [data, draftAssignments]); // Include draftAssignments to trigger re-render

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
	}, [getDraftAssignment, removeDraftAssignment, validDraftCount]);

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
				key={`table-${validDraftCount}`}
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
				onAssignNow={handleAssignNow}
				lecturerOptions={lecturerOptions}
				showAssignNow={
					selectedGroup?.supervisorDetails &&
					selectedGroup.supervisorDetails.length > 0
				}
				isChangeMode={selectedGroup?.status === 'Finalized'}
			/>
		</Space>
	);
}
