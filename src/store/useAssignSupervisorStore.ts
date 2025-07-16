import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import lecturerService from '@/lib/services/lecturers.service';
import supervisionService from '@/lib/services/supervisions.service';
import thesesService from '@/lib/services/theses.service';
import { handleApiError, handleApiResponse } from '@/lib/utils/handleApi';
import { showNotification } from '@/lib/utils/notification';
import { type Lecturer } from '@/schemas/lecturer';
import { type Supervision } from '@/schemas/supervision';
import { type Thesis } from '@/schemas/thesis';
import { useSupervisionStore } from '@/store/useSupervisionStore';

export type SupervisorAssignmentStatus =
	| 'Finalized'
	| 'Incomplete'
	| 'Unassigned';

export interface SupervisorAssignmentData {
	id: string;
	thesisTitle: string;
	groupName: string; // Now represents abbreviation
	memberCount: string; // Now represents domain
	supervisors: string[];
	supervisorDetails: Array<{
		id: string;
		fullName: string;
		email: string;
	}>;
	status: SupervisorAssignmentStatus;
	thesisId: string;
	groupId: string | null;
}

// Helper functions to reduce cognitive complexity
const processSupervisionData = async (
	thesis: Thesis,
): Promise<{
	supervisions: Supervision[];
	supervisorDetails: Array<{
		id: string;
		fullName: string;
		email: string;
	}>;
}> => {
	const supervisionPromise = supervisionService.getByThesisId(thesis.id);
	const [supervisionResult] = await Promise.allSettled([supervisionPromise]);

	let supervisions: Supervision[] = [];

	if (supervisionResult.status === 'fulfilled') {
		const supervisionApiResponse = handleApiResponse(supervisionResult.value);

		if (supervisionApiResponse.success) {
			supervisions = supervisionApiResponse.data || [];
		} else {
			console.warn(
				`Failed to fetch supervisions for thesis ${thesis.id}:`,
				supervisionApiResponse.error,
			);
		}
	} else {
		console.warn(
			`Promise rejected when fetching supervisions for thesis ${thesis.id}:`,
			supervisionResult.reason,
		);
	}

	const supervisorDetails = await fetchSupervisorDetails(
		thesis.id,
		supervisions,
	);

	return { supervisions, supervisorDetails };
};

const fetchSupervisorDetails = async (
	thesisId: string,
	supervisions: Supervision[],
): Promise<
	Array<{
		id: string;
		fullName: string;
		email: string;
	}>
> => {
	if (supervisions.length === 0) {
		return [];
	}

	// Handle SimpleSupervisionSchema format: {lecturerId: 'uuid'}
	const supervisionsData = supervisions as unknown as { lecturerId: string }[];
	const validSupervisions = supervisionsData.filter(
		(supervision) => supervision.lecturerId,
	);

	const invalidSupervisions = supervisionsData.filter(
		(supervision) => !supervision.lecturerId,
	);

	if (invalidSupervisions.length > 0) {
		console.warn(
			`Found ${invalidSupervisions.length} invalid supervisions for thesis ${thesisId}:`,
			invalidSupervisions,
		);
	}

	if (validSupervisions.length === 0) {
		return [];
	}

	const lecturerPromises = validSupervisions.map((supervision) =>
		lecturerService.findOne(supervision.lecturerId),
	);

	const lecturerResults = await Promise.allSettled(lecturerPromises);
	const supervisorDetails: Array<{
		id: string;
		fullName: string;
		email: string;
	}> = [];

	for (const result of lecturerResults) {
		if (result.status === 'fulfilled') {
			const lecturerApiResponse = handleApiResponse(result.value);

			if (lecturerApiResponse.success && lecturerApiResponse.data) {
				supervisorDetails.push({
					id: lecturerApiResponse.data.id,
					fullName: lecturerApiResponse.data.fullName,
					email: lecturerApiResponse.data.email,
				});
			}
		}
	}

	return supervisorDetails;
};

const createAssignmentData = (
	thesis: Thesis,
	supervisions: Supervision[],
	supervisorDetails: Array<{
		id: string;
		fullName: string;
		email: string;
	}>,
): SupervisorAssignmentData => {
	const abbreviation = thesis.abbreviation || 'No Abbreviation';
	const domain = thesis.domain || 'No Domain';

	const supervisionCount = supervisions.length;
	const status: SupervisorAssignmentStatus =
		supervisionCount === 2
			? 'Finalized'
			: supervisionCount === 1
				? 'Incomplete'
				: 'Unassigned';

	const supervisorNames = supervisorDetails.map((s) => s.fullName);

	return {
		id: thesis.id,
		thesisTitle: thesis.englishName,
		groupName: abbreviation,
		memberCount: domain,
		supervisors: supervisorNames,
		supervisorDetails,
		status,
		thesisId: thesis.id,
		groupId: thesis.groupId || null,
	};
};

interface AssignSupervisorState {
	// Data
	data: SupervisorAssignmentData[];
	lecturers: Lecturer[];

	// Loading states
	loading: boolean;
	refreshing: boolean;
	updating: boolean;

	// Error states
	lastError: string | null;

	// Cache state
	lastFetchTime: number | null;
	cacheExpiry: number; // Cache expiry time in milliseconds (5 minutes)

	// Helper functions
	determineStatus: (supervisions: Supervision[]) => SupervisorAssignmentStatus;

	// Actions
	fetchData: (forceRefresh?: boolean) => Promise<void>;
	changeSupervisor: (
		thesisId: string,
		currentSupervisorId: string,
		newSupervisorId: string,
	) => Promise<boolean>;
	refreshData: () => Promise<void>;
	clearError: () => void;
	isCacheValid: () => boolean;

	// Optimistic update methods
	updateAssignmentOptimistically: (
		thesisId: string,
		newSupervisors: Array<{ id: string; fullName: string; email: string }>,
	) => void;
	revertOptimisticUpdate: (
		thesisId: string,
		originalData: SupervisorAssignmentData,
	) => void;

	// Bulk assignment with optimistic updates
	bulkAssignSupervisors: (
		assignments: Array<{
			thesisId: string;
			lecturerIds: string[];
		}>,
	) => Promise<boolean>;
}

export const useAssignSupervisorStore = create<AssignSupervisorState>()(
	devtools(
		(set, get) => ({
			// Initial state
			data: [],
			lecturers: [],
			loading: false,
			refreshing: false,
			updating: false,
			lastError: null,
			lastFetchTime: null,
			cacheExpiry: 5 * 60 * 1000, // 5 minutes

			// Check if cache is valid
			isCacheValid: (): boolean => {
				const { lastFetchTime, cacheExpiry } = get();
				if (!lastFetchTime) return false;
				return Date.now() - lastFetchTime < cacheExpiry;
			},

			// Determine status based on supervision count
			determineStatus: (
				supervisions: Supervision[],
			): SupervisorAssignmentStatus => {
				const supervisionCount = supervisions.length;
				if (supervisionCount === 2) return 'Finalized';
				if (supervisionCount === 1) return 'Incomplete';
				return 'Unassigned';
			},

			// Fetch all data
			fetchData: async (forceRefresh = false): Promise<void> => {
				// Skip fetch if cache is valid and not forcing refresh
				if (!forceRefresh && get().isCacheValid() && get().data.length > 0) {
					return;
				}

				set({ loading: true, lastError: null });

				try {
					const [thesesResponse, lecturersResponse] = await Promise.all([
						thesesService.findAll(),
						lecturerService.findAll(),
					]);

					const thesesResult = handleApiResponse(thesesResponse);
					const lecturersResult = handleApiResponse(lecturersResponse);

					if (!thesesResult.success) {
						console.error('Theses fetch failed:', thesesResult.error);
						throw new Error(
							thesesResult.error?.message || 'Failed to fetch theses',
						);
					}

					if (!lecturersResult.success) {
						console.error('Lecturers fetch failed:', lecturersResult.error);
						throw new Error(
							lecturersResult.error?.message || 'Failed to fetch lecturers',
						);
					}

					set({ lecturers: lecturersResult.data || [] });

					// Filter only approved and published theses
					const filteredTheses = (thesesResult.data || []).filter(
						(thesis: Thesis) =>
							thesis.status === 'Approved' && thesis.isPublish === true,
					);

					// Process each thesis
					const thesesWithData = await Promise.all(
						filteredTheses.map(async (thesis) => {
							const { supervisions, supervisorDetails } =
								await processSupervisionData(thesis);

							return createAssignmentData(
								thesis,
								supervisions,
								supervisorDetails,
							);
						}),
					);

					set({
						data: thesesWithData,
						loading: false,
						lastFetchTime: Date.now(),
					});
				} catch (err) {
					console.error('Error in fetchData:', err);
					const { message } = handleApiError(
						err,
						'Failed to fetch assign supervisor data',
					);
					set({ lastError: message, loading: false });
					showNotification.error('Error', message);
				}
			},

			// Change supervisor with optimistic updates
			changeSupervisor: async (
				thesisId: string,
				currentSupervisorId: string,
				newSupervisorId: string,
				silent = false,
			) => {
				// Find original data for potential rollback
				const originalAssignment = get().data.find(
					(item) => item.thesisId === thesisId,
				);
				if (!originalAssignment) return false;

				// Find new lecturer details
				const newLecturer = get().lecturers.find(
					(l) => l.id === newSupervisorId,
				);
				if (!newLecturer) return false;

				// Optimistic update
				const updatedSupervisorDetails =
					originalAssignment.supervisorDetails.map((supervisor) =>
						supervisor.id === currentSupervisorId
							? {
									id: newLecturer.id,
									fullName: newLecturer.fullName,
									email: newLecturer.email,
								}
							: supervisor,
					);

				get().updateAssignmentOptimistically(
					thesisId,
					updatedSupervisorDetails,
				);

				try {
					const supervisionStore = useSupervisionStore.getState();
					const success = await supervisionStore.changeSupervisor(thesisId, {
						currentSupervisorId,
						newSupervisorId,
					});

					if (!success) {
						// Revert optimistic update on failure
						get().revertOptimisticUpdate(thesisId, originalAssignment);

						// Get error from supervision store if available
						const supervisionError = supervisionStore.lastError;
						const errorMessage =
							supervisionError || 'Failed to change supervisor';

						if (!silent) {
							showNotification.error('Error', errorMessage);
						}
						return false;
					}

					if (!silent) {
						showNotification.success(
							'Success',
							'Supervisor changed successfully',
						);
					}
					return true;
				} catch (error) {
					// Revert optimistic update on error
					get().revertOptimisticUpdate(thesisId, originalAssignment);
					const { message } = handleApiError(
						error,
						'Failed to change supervisor',
					);
					if (!silent) {
						showNotification.error('Error', message);
					}
					return false;
				}
			},

			// Optimistic update assignment
			updateAssignmentOptimistically: (
				thesisId: string,
				newSupervisors: Array<{ id: string; fullName: string; email: string }>,
			): void => {
				set((state) => ({
					data: state.data.map((item) =>
						item.thesisId === thesisId
							? {
									...item,
									supervisorDetails: newSupervisors,
									supervisors: newSupervisors.map((s) => s.fullName),
									status: get().determineStatus(
										newSupervisors.map(
											(s) =>
												({
													id: `temp-${s.id}`,
													status: 'Active' as const,
													lecturer: {
														id: s.id,
														fullName: s.fullName,
														email: s.email,
													},
												}) as Supervision,
										),
									),
								}
							: item,
					),
				}));
			},

			// Revert optimistic update
			revertOptimisticUpdate: (
				thesisId: string,
				originalData: SupervisorAssignmentData,
			): void => {
				set((state) => ({
					data: state.data.map((item) =>
						item.thesisId === thesisId ? originalData : item,
					),
				}));
			},

			// Bulk assign supervisors with optimistic updates
			bulkAssignSupervisors: async (
				assignments: Array<{
					thesisId: string;
					lecturerIds: string[];
				}>,
				silent = false,
			) => {
				set({ updating: true });

				// Store original data for potential rollback
				const originalData = get().data;

				try {
					// Optimistic updates for all assignments
					assignments.forEach((assignment) => {
						const supervisors = assignment.lecturerIds
							.map((id) => get().lecturers.find((l) => l.id === id))
							.filter(Boolean) as Array<{
							id: string;
							fullName: string;
							email: string;
						}>;

						if (supervisors.length > 0) {
							get().updateAssignmentOptimistically(
								assignment.thesisId,
								supervisors,
							);
						}
					});

					// Call API
					const supervisionStore = useSupervisionStore.getState();
					const result = await supervisionStore.bulkAssignSupervisors({
						assignments,
					});

					if (!result) {
						// No result returned - API error
						set({ data: originalData });

						// Get error from supervision store if available
						const supervisionError = useSupervisionStore.getState().lastError;
						const errorMessage = supervisionError || 'No response from server';

						showNotification.error('Assignment Failed', errorMessage);
						return false;
					}

					// Analyze results based on backend response
					const { successful, failed } = result.summary;

					// Analyze detailed results to provide better feedback
					const warningStatuses = ['already_exists', 'max_supervisors_reached'];

					const detailedResults = result.results || [];
					const warningCount = detailedResults.filter((r: { status: string }) =>
						warningStatuses.includes(r.status),
					).length;

					if (successful === 0) {
						// Complete failure - revert all optimistic updates
						set({ data: originalData });

						if (!silent) {
							if (warningCount > 0) {
								showNotification.warning(
									'Assignment Skipped',
									`${warningCount} assignments were skipped (already assigned or max supervisors reached)`,
								);
							} else {
								showNotification.error(
									'Assignment Failed',
									'All assignments failed',
								);
							}
						}
						return false;
					}

					if (failed === 0) {
						// Complete success - all assignments succeeded
						if (!silent) {
							if (warningCount > 0) {
								showNotification.success(
									'Assignment Complete',
									`${successful} supervisors assigned successfully, ${warningCount} were already assigned`,
								);
							} else {
								showNotification.success(
									'Assignment Complete',
									`All ${successful} supervisors assigned successfully`,
								);
							}
						}
						return true;
					}

					// Partial success - some succeeded, some failed
					// Only revert the assignments that actually failed
					const failedResults = detailedResults.filter(
						(r: { status: string }) => r.status === 'error',
					);
					const warningResults = detailedResults.filter(
						(r: { status: string }) => warningStatuses.includes(r.status),
					);

					// Revert only the truly failed assignments (not warnings)
					failedResults.forEach(
						(failedResult: { thesisId?: string; lecturerId?: string }) => {
							if (failedResult.thesisId && failedResult.lecturerId) {
								// Find and revert this specific assignment
								const currentData = get().data;
								const updatedData = currentData.map((assignment) => {
									if (assignment.thesisId === failedResult.thesisId) {
										// Remove the lecturer that failed to be assigned
										return {
											...assignment,
											supervisors: assignment.supervisors.filter(
												(supervisorId) =>
													supervisorId !== failedResult.lecturerId,
											),
											supervisorDetails: assignment.supervisorDetails.filter(
												(detail) => detail.id !== failedResult.lecturerId,
											),
											status: get().determineStatus([]), // Recalculate status
										};
									}
									return assignment;
								});
								set({ data: updatedData });
							}
						},
					);

					// Show appropriate notification based on results
					const actualSuccesses = successful;
					const actualWarnings = warningResults.length;
					const actualFailures = failed - actualWarnings; // True failures (not warnings)

					if (actualFailures > 0) {
						if (!silent) {
							showNotification.warning(
								'Partial Success',
								`${actualSuccesses} assignments succeeded, ${actualWarnings} were already assigned, ${actualFailures} failed`,
							);
						}
						return false; // Return false if there are actual failures
					} else {
						// Only warnings, no real failures
						if (!silent) {
							showNotification.success(
								'Assignment Complete',
								`${actualSuccesses} supervisors assigned successfully, ${actualWarnings} were already assigned`,
							);
						}
						return true; // Return true for complete success
					}
				} catch (error) {
					// Revert all optimistic updates on error
					set({ data: originalData });
					const { message } = handleApiError(
						error,
						'Failed to bulk assign supervisors',
					);
					if (!silent) {
						showNotification.error('Error', message);
					}
					return false;
				} finally {
					set({ updating: false });
				}
			},

			// Refresh data
			refreshData: async (): Promise<void> => {
				set({ refreshing: true });
				await get().fetchData(true); // Force refresh
				set({ refreshing: false });
			},

			// Clear error
			clearError: (): void => set({ lastError: null }),
		}),
		{
			name: 'assign-supervisor-store',
		},
	),
);
