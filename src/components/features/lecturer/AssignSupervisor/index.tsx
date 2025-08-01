'use client';

import { Alert, Button, Space, notification } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import { ConfirmationModal } from '@/components/common/ConfirmModal';
import { Header } from '@/components/common/Header';
import AssignSupervisorModal from '@/components/features/lecturer/AssignSupervisor/AssignSupervisorModal';
import {
	TABLE_WIDTHS,
	baseColumns,
	createActionRenderer,
	createSupervisorRenderer,
} from '@/components/features/lecturer/AssignSupervisor/SupervisorColumns';
import SupervisorFilterBar from '@/components/features/lecturer/AssignSupervisor/SupervisorFilterBar';
import ThesisOverviewTable from '@/components/features/lecturer/AssignSupervisor/ThesisOverviewTable';
import { useAssignSupervisor } from '@/hooks/lecturer/useAssignSupervisor';
import { useCurrentSemester } from '@/hooks/semester';
import { type SupervisorAssignmentData } from '@/store/useAssignSupervisorStore';
import { useDraftAssignmentStore } from '@/store/useDraftAssignmentStore';
import { useSemesterStore } from '@/store/useSemesterStore';
import { useSupervisionStore } from '@/store/useSupervisionStore';

/**
 * Main component for assigning supervisors to thesis groups
 */

export default function AssignSupervisors() {
	// Get current semester for default filter
	const { currentSemester } = useCurrentSemester();

	const [search, setSearch] = useState('');
	const [selectedGroup, setSelectedGroup] =
		useState<SupervisorAssignmentData | null>(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [saveDraftLoading, setSaveDraftLoading] = useState(false);
	const [assignNowLoading, setAssignNowLoading] = useState(false);
	const [semesterFilter, setSemesterFilter] = useState<string>('All');

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

	// Semester store for real semester data
	const { semesters, fetchSemesters } = useSemesterStore();

	// Supervision store for getting change supervisor errors
	const { lastError: supervisionError } = useSupervisionStore();

	// Set default semester filter when current semester is available
	useEffect(() => {
		if (currentSemester && semesterFilter === 'All') {
			setSemesterFilter(currentSemester.id);
		}
	}, [currentSemester, semesterFilter]);

	// Manual fetch on component mount
	useEffect(() => {
		// Fetch semesters and initial data
		fetchSemesters();
		fetchData();
	}, [fetchData, fetchSemesters]);

	// Fetch data when semester filter changes
	useEffect(() => {
		if (semesterFilter === 'All') {
			fetchData(true); // Force refresh for all semesters
		} else {
			fetchData(true, semesterFilter); // Force refresh for specific semester
		}
	}, [semesterFilter, fetchData]);

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

	// Create semester options with "All" option
	const semesterOptions = useMemo(() => {
		const semesterChoices = semesters.map((semester) => ({
			value: semester.id,
			label: semester.name,
		}));
		return [{ value: 'All', label: 'All Semesters' }, ...semesterChoices];
	}, [semesters]);

	const filteredData = useMemo(() => {
		return data.filter((item) => {
			const searchText = search.toLowerCase();
			const matchesSearch = [item.abbreviation, item.thesisTitle].some(
				(field) => field.toLowerCase().includes(searchText),
			);
			// Semester filtering is now handled server-side
			return matchesSearch;
		});
	}, [data, search]);

	/**
	 * Handle bulk assignment of all draft assignments using single API call
	 */
	const handleBulkAssignment = async (): Promise<void> => {
		const drafts = getDraftsList();

		// Filter out drafts for theses with 2 supervisors (finalized)
		const validDrafts = drafts.filter((draft) => {
			const thesis = data.find((item) => item.thesisId === draft.thesisId);
			return thesis && thesis.supervisors.length < 2;
		});

		if (validDrafts.length === 0) {
			return;
		}

		// Prepare assignments for bulk API call
		const assignments = validDrafts.map((draft) => ({
			thesisId: draft.thesisId,
			lecturerIds: draft.lecturerIds,
		}));

		// Use store's bulk assignment function with single API call
		const success = await bulkAssignSupervisors(assignments, false);

		if (success) {
			// Clear all successful drafts
			validDrafts.forEach((draft) => {
				removeDraftAssignment(draft.thesisId);
			});
		}

		// Note: Notifications are handled by the store
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
			// Use silent mode to prevent duplicate notifications
			return await bulkAssignSupervisors(assignments, true);
		}

		// If no new supervisors, remove all using bulk assign with empty array
		if (newSupervisorIds.length === 0) {
			const assignments = [{ thesisId, lecturerIds: [] }];
			return await bulkAssignSupervisors(assignments, true);
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

				// Use silent mode to prevent duplicate notifications
				const changeSuccess = await changeSupervisor(
					thesisId,
					currentSupervisorId,
					newSupervisorId,
					true, // silent mode
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
				const bulkSuccess = await bulkAssignSupervisors(assignments, true); // silent mode

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
			groupName: selectedGroup.abbreviation,
			lecturerIds: supervisorIds,
			lecturerNames,
		});
	};

	/**
	 * Handle save draft action from modal
	 */
	const handleSaveDraft = (supervisorIds: string[]): void => {
		if (!selectedGroup) return;

		setSaveDraftLoading(true);

		// Don't allow drafts for theses with 2 supervisors (finalized)
		if (selectedGroup.supervisors.length >= 2) {
			setSaveDraftLoading(false);
			return;
		}

		// Don't save empty drafts
		if (supervisorIds.length === 0) {
			setModalOpen(false);
			setSelectedGroup(null);
			setSaveDraftLoading(false);
			return;
		}

		// Always save as draft
		handleAssignmentMode(supervisorIds);
		setModalOpen(false);
		setSelectedGroup(null);
		setSaveDraftLoading(false);

		// Show success notification
		notification.success({
			message: 'Draft Saved',
			description: 'Supervisor assignment saved as draft',
		});
	};

	/**
	 * Handle assign now action from modal (for change cases)
	 */
	const handleAssignNow = async (supervisorIds: string[]): Promise<void> => {
		if (!selectedGroup) return;

		setAssignNowLoading(true);

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

				// Show success notification for change operations
				notification.success({
					message: 'Success',
					description: 'Supervisor assignment completed successfully',
				});
			} else {
				// Show error notification with the actual error from supervision store
				const errorMessage =
					supervisionError || error || 'Failed to change supervisor assignment';
				notification.error({
					message: 'Error',
					description: errorMessage,
				});
			}
		} catch {
			// Error handling is done in individual functions
		}

		setAssignNowLoading(false);
	};

	/**
	 * Handle single assignment (for non-finalized theses)
	 */
	const handleSingleAssignment = async (
		supervisorIds: string[],
	): Promise<void> => {
		if (!selectedGroup) return;

		setAssignNowLoading(true);

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

				// Show success notification for assignments
				notification.success({
					message: 'Success',
					description: 'Supervisor assignment completed successfully',
				});
			} else {
				// Show error notification with the actual error from supervision store
				const errorMessage =
					supervisionError || error || 'Failed to assign supervisors';
				notification.error({
					message: 'Error',
					description: errorMessage,
				});
			}
		} catch {
			// Error handling is done in individual functions
		}

		setAssignNowLoading(false);
	};

	/**
	 * Handle bulk assignment confirmation
	 */
	const handleBulkAssignmentConfirm = (): void => {
		const drafts = getDraftsList();

		// Filter out drafts for theses with 2 supervisors (finalized)
		const validDrafts = drafts.filter((draft) => {
			const thesis = data.find((item) => item.thesisId === draft.thesisId);
			return thesis && thesis.supervisors.length < 2;
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

	// Calculate valid draft count (exclude theses with 2 supervisors)
	const validDraftCount = useMemo(() => {
		const drafts = Object.values(draftAssignments);
		const validCount = drafts.filter((draft) => {
			const thesis = data.find((item) => item.thesisId === draft.thesisId);
			return thesis && thesis.supervisors.length < 2;
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
				width: TABLE_WIDTHS.ACTIONS,
				align: 'center' as const,
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

	// Get initial values for modal (draft values take priority over current values)
	const getModalInitialValues = (): string[] => {
		if (!selectedGroup) return [];

		// Check if there's a draft for this thesis
		const draft = getDraftAssignment(selectedGroup.thesisId);
		if (draft) {
			return draft.lecturerIds;
		}

		// Otherwise use current supervisors
		return selectedGroup.supervisorDetails.map((s) => s.id);
	};

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
				semester={semesterFilter}
				onSemesterChange={setSemesterFilter}
				onRefresh={refreshData}
				refreshing={refreshing}
				onAssignAllDrafts={handleBulkAssignmentConfirm}
				draftCount={validDraftCount}
				updating={updating}
				semesterOptions={semesterOptions}
			/>

			<ThesisOverviewTable
				data={filteredData}
				columns={columns}
				loading={loading}
				key={`table-${validDraftCount}-${draftCount}`}
			/>

			<AssignSupervisorModal
				open={modalOpen}
				loading={assignNowLoading}
				saveDraftLoading={saveDraftLoading}
				onCancel={() => {
					setModalOpen(false);
					setSelectedGroup(null);
				}}
				initialValues={getModalInitialValues()}
				onSaveDraft={handleSaveDraft}
				onAssignNow={
					selectedGroup && selectedGroup.supervisors.length >= 2
						? handleAssignNow
						: handleSingleAssignment
				}
				lecturerOptions={lecturerOptions}
				showAssignNow={true} // Always show assign now button
				isChangeMode={
					selectedGroup ? selectedGroup.supervisors.length === 2 : false
				}
			/>
		</Space>
	);
}
