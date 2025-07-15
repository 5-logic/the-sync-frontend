import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import lecturerService from '@/lib/services/lecturers.service';
import supervisionService from '@/lib/services/supervisions.service';
import thesesService from '@/lib/services/theses.service';
import { handleApiError, handleApiResponse } from '@/lib/utils/handleApi';
import { showNotification } from '@/lib/utils/notification';
import { type Lecturer } from '@/schemas/lecturer';
import { type Supervision } from '@/schemas/supervision';
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

	// Helper functions
	determineStatus: (supervisions: Supervision[]) => SupervisorAssignmentStatus;

	// Actions
	fetchData: () => Promise<void>;
	changeSupervisor: (
		thesisId: string,
		currentSupervisorId: string,
		newSupervisorId: string,
	) => Promise<boolean>;
	refreshData: () => Promise<void>;
	clearError: () => void;

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
			fetchData: async (): Promise<void> => {
				set({ loading: true, lastError: null });

				try {
					console.log('Starting fetchData...');
					const [thesesResponse, lecturersResponse] = await Promise.all([
						thesesService.findAll(),
						lecturerService.findAll(),
					]);

					console.log('Raw API responses:', {
						thesesResponse,
						lecturersResponse,
					});

					const thesesResult = handleApiResponse(thesesResponse);
					const lecturersResult = handleApiResponse(lecturersResponse);

					console.log('Processed API responses:', {
						thesesResult,
						lecturersResult,
					});

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

					console.log('Theses data:', thesesResult.data);
					console.log('Lecturers data:', lecturersResult.data);

					set({ lecturers: lecturersResult.data || [] });

					// Process each thesis
					console.log(
						'Processing theses, count:',
						(thesesResult.data || []).length,
					);
					const thesesWithData = await Promise.all(
						(thesesResult.data || []).map(async (thesis, index) => {
							console.log(`Processing thesis ${index + 1}:`, thesis);
							const supervisionPromise = supervisionService.getByThesisId(
								thesis.id,
							);

							const [supervisionResult] = await Promise.allSettled([
								supervisionPromise,
							]);

							console.log(
								`Supervision result for thesis ${thesis.id}:`,
								supervisionResult,
							);

							// Process supervision data
							let supervisions: Supervision[] = [];
							let supervisorDetails: Array<{
								id: string;
								fullName: string;
								email: string;
							}> = [];

							if (supervisionResult.status === 'fulfilled') {
								const supervisionApiResponse = handleApiResponse(
									supervisionResult.value,
								);
								console.log(
									`Supervision API response for thesis ${thesis.id}:`,
									supervisionApiResponse,
								);

								if (supervisionApiResponse.success) {
									supervisions = supervisionApiResponse.data || [];
									console.log(
										`Found ${supervisions.length} supervisions for thesis ${thesis.id}`,
									);
									if (supervisions.length > 0) {
										console.log(
											'Supervision data structure for thesis',
											thesis.id,
											':',
											supervisions,
										);
									}
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

							// Fetch lecturer details if we have supervisions
							if (supervisions.length > 0) {
								// Filter out supervisions with invalid lecturer data
								// Handle SimpleSupervisionSchema format: {lecturerId: 'uuid'}
								// The API returns simple supervision objects with lecturerId directly
								// Note: Runtime data differs from TypeScript definition
								const supervisionsData = supervisions as unknown as {
									lecturerId: string;
								}[];
								const validSupervisions = supervisionsData.filter(
									(supervision) => supervision.lecturerId,
								);

								const invalidSupervisions = supervisionsData.filter(
									(supervision) => !supervision.lecturerId,
								);

								if (invalidSupervisions.length > 0) {
									console.warn(
										`Found ${invalidSupervisions.length} invalid supervisions for thesis ${thesis.id}:`,
										invalidSupervisions,
									);
								}

								console.log(
									`Valid supervisions for thesis ${thesis.id}:`,
									validSupervisions.length,
									'/',
									supervisions.length,
								);

								if (validSupervisions.length === 0) {
									console.log(
										`No valid supervisions found for thesis ${thesis.id}`,
									);
									supervisorDetails = [];
								} else {
									const lecturerPromises = validSupervisions.map(
										(supervision) =>
											lecturerService.findOne(supervision.lecturerId),
									);

									const lecturerResults =
										await Promise.allSettled(lecturerPromises);

									supervisorDetails = [];
									for (const result of lecturerResults) {
										if (result.status === 'fulfilled') {
											const lecturerApiResponse = handleApiResponse(
												result.value,
											);
											if (
												lecturerApiResponse.success &&
												lecturerApiResponse.data
											) {
												supervisorDetails.push({
													id: lecturerApiResponse.data.id,
													fullName: lecturerApiResponse.data.fullName,
													email: lecturerApiResponse.data.email,
												});
											}
										}
									}
								}
							}

							// Use thesis data directly - no need to fetch group
							const abbreviation = thesis.abbreviation || 'No Abbreviation';
							const domain = thesis.domain || 'No Domain';

							// Calculate status based on actual supervision count
							const supervisionCount = supervisions.length;
							const status: SupervisorAssignmentStatus =
								supervisionCount === 2
									? 'Finalized'
									: supervisionCount === 1
										? 'Incomplete'
										: 'Unassigned';
							const supervisorNames = supervisorDetails.map((s) => s.fullName);

							const finalResult = {
								id: thesis.id,
								thesisTitle: thesis.englishName,
								groupName: abbreviation, // Now represents abbreviation
								memberCount: domain, // Now represents domain (should be string but keeping number for compatibility)
								supervisors: supervisorNames,
								supervisorDetails,
								status,
								thesisId: thesis.id,
								groupId: thesis.groupId || null,
							};
							console.log(`Final result for thesis ${thesis.id}:`, finalResult);
							return finalResult;
						}),
					);

					console.log('All processed theses:', thesesWithData);
					console.log('Setting data with', thesesWithData.length, 'items');
					set({ data: thesesWithData, loading: false });
				} catch (err) {
					console.error('Error in fetchData:', err);
					const { message } = handleApiError(
						err,
						'Failed to fetch assign supervisor data',
					);
					console.error('Error message:', message);
					set({ lastError: message, loading: false });
					showNotification.error('Error', message);
				}
			},

			// Change supervisor with optimistic updates
			changeSupervisor: async (
				thesisId: string,
				currentSupervisorId: string,
				newSupervisorId: string,
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

						showNotification.error('Error', errorMessage);
						return false;
					}

					showNotification.success(
						'Success',
						'Supervisor changed successfully',
					);
					return true;
				} catch (error) {
					// Revert optimistic update on error
					get().revertOptimisticUpdate(thesisId, originalAssignment);
					const { message } = handleApiError(
						error,
						'Failed to change supervisor',
					);
					showNotification.error('Error', message);
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

					console.log('Bulk assignment API result:', result);

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
					const totalAttempted = successful + failed;

					console.log(
						`Assignment results: ${successful} succeeded, ${failed} failed out of ${totalAttempted} total`,
					);

					// Analyze detailed results to provide better feedback
					const warningStatuses = ['already_exists', 'max_supervisors_reached'];

					const detailedResults = result.results || [];
					const warningCount = detailedResults.filter((r: { status: string }) =>
						warningStatuses.includes(r.status),
					).length;

					if (successful === 0) {
						// Complete failure - revert all optimistic updates
						set({ data: originalData });

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
						return false;
					}

					if (failed === 0) {
						// Complete success - all assignments succeeded
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

					console.log('Failed assignments:', failedResults);
					console.log('Warning assignments:', warningResults);

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
						showNotification.warning(
							'Partial Success',
							`${actualSuccesses} assignments succeeded, ${actualWarnings} were already assigned, ${actualFailures} failed`,
						);
					} else {
						// Only warnings, no real failures
						showNotification.success(
							'Assignment Complete',
							`${actualSuccesses} supervisors assigned successfully, ${actualWarnings} were already assigned`,
						);
					}
					return true; // Still return true because some succeeded
				} catch (error) {
					// Revert all optimistic updates on error
					set({ data: originalData });
					const { message } = handleApiError(
						error,
						'Failed to bulk assign supervisors',
					);
					showNotification.error('Error', message);
					return false;
				} finally {
					set({ updating: false });
				}
			},

			// Refresh data
			refreshData: async (): Promise<void> => {
				set({ refreshing: true });
				await get().fetchData();
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
