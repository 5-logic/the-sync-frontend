import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import supervisionService, {
	type SupervisionData,
} from '@/lib/services/supervisions.service';
import { handleApiError, handleApiResponse } from '@/lib/utils/handleApi';
import { showNotification } from '@/lib/utils/notification';
import {
	type AssignSupervisorRequest,
	type BulkAssignmentRequest,
	type BulkAssignmentResponse,
	type ChangeSupervisorRequest,
} from '@/schemas/supervision';

interface SupervisionState {
	// Data
	supervisions: SupervisionData[];

	// Loading states
	loading: boolean;
	assigning: boolean;
	changing: boolean;
	bulkAssigning: boolean;

	// Error states
	lastError: string | null;

	// Actions
	getByThesisId: (thesisId: string) => Promise<SupervisionData[]>;
	assignSupervisor: (
		thesisId: string,
		data: AssignSupervisorRequest,
	) => Promise<boolean>;
	changeSupervisor: (
		thesisId: string,
		data: ChangeSupervisorRequest,
	) => Promise<boolean>;
	bulkAssignSupervisors: (
		data: BulkAssignmentRequest,
	) => Promise<BulkAssignmentResponse | null>;
	clearError: () => void;
}

export const useSupervisionStore = create<SupervisionState>()(
	devtools(
		(set) => ({
			// Initial state
			supervisions: [],
			loading: false,
			assigning: false,
			changing: false,
			bulkAssigning: false,
			lastError: null,

			// Get supervisions by thesis ID
			getByThesisId: async (thesisId: string) => {
				set({ loading: true, lastError: null });

				try {
					const response = await supervisionService.getByThesisId(thesisId);
					const { success, data, error } = handleApiResponse(response);

					if (success) {
						set({ supervisions: data, loading: false });
						return data;
					} else {
						const errorMessage =
							error?.message || 'Failed to fetch supervisions';
						set({ lastError: errorMessage, loading: false });
						return [];
					}
				} catch (err) {
					const { message } = handleApiError(
						err,
						'Failed to fetch supervisions',
					);
					set({ lastError: message, loading: false });
					showNotification.error('Error', message);
					return [];
				}
			},

			// Assign supervisor
			assignSupervisor: async (
				thesisId: string,
				data: AssignSupervisorRequest,
			) => {
				set({ assigning: true, lastError: null });

				try {
					const response = await supervisionService.assignSupervisor(
						thesisId,
						data,
					);
					const { success, error } = handleApiResponse(response);

					if (success) {
						set({ assigning: false });
						// Don't show notification here - let calling store handle it
						return true;
					} else {
						const errorMessage =
							error?.message || 'Failed to assign supervisor';
						set({ lastError: errorMessage, assigning: false });
						// Don't show notification here - let calling store handle it
						return false;
					}
				} catch (err) {
					const { message } = handleApiError(
						err,
						'Failed to assign supervisor',
					);
					set({ lastError: message, assigning: false });
					// Don't show notification here - let calling store handle it
					return false;
				}
			},

			// Change supervisor - uses bulkAssignSupervisors API
			changeSupervisor: async (
				thesisId: string,
				data: ChangeSupervisorRequest,
			) => {
				set({ changing: true, lastError: null });

				try {
					// Use bulkAssignSupervisors API for change supervisor
					const bulkAssignData: BulkAssignmentRequest = {
						assignments: [
							{
								thesisId: thesisId,
								lecturerIds: [data.currentSupervisorId, data.newSupervisorId],
							},
						],
					};

					const response =
						await supervisionService.bulkAssignSupervisors(bulkAssignData);
					const {
						success,
						data: responseData,
						error,
					} = handleApiResponse(response);

					if (success && responseData) {
						set({ changing: false });

						// Check if the change was successful
						let results: Array<{
							thesisId: string;
							lecturerId: string;
							status: string;
							message?: string;
						}>;

						if (Array.isArray(responseData)) {
							results = responseData;
						} else {
							console.error('Unexpected response format:', responseData);
							results = [];
						}

						// Check if at least one assignment was successful
						const hasSuccess = results.some(
							(r) => r.status === 'success' || r.status === 'already_exists',
						);

						if (hasSuccess) {
							return true;
						} else {
							// Extract error messages from failed results
							const failedResults = results.filter(
								(r) => r.status !== 'success' && r.status !== 'already_exists',
							);

							// Use the first available error message from the results
							const errorMessage =
								failedResults.length > 0 && failedResults[0].message
									? failedResults[0].message
									: error?.message || 'Failed to change supervisor';

							set({ lastError: errorMessage });
							return false;
						}
					} else {
						const errorMessage =
							error?.message || 'Failed to change supervisor';
						set({ lastError: errorMessage, changing: false });
						return false;
					}
				} catch (err) {
					const { message } = handleApiError(
						err,
						'Failed to change supervisor',
					);
					set({ lastError: message, changing: false });
					return false;
				}
			}, // Clear error
			clearError: (): void => set({ lastError: null }),

			// Bulk assign supervisors
			bulkAssignSupervisors: async (data: BulkAssignmentRequest) => {
				set({ bulkAssigning: true, lastError: null });

				try {
					const response = await supervisionService.bulkAssignSupervisors(data);
					const {
						success,
						data: responseData,
						error,
					} = handleApiResponse(response);

					if (success && responseData) {
						set({ bulkAssigning: false });

						// Handle actual API response format (array of results)
						let results: Array<{
							thesisId: string;
							lecturerId: string;
							status: string;
						}>;

						// API returns array directly
						if (Array.isArray(responseData)) {
							results = responseData;
						} else {
							console.error('Unexpected response format:', responseData);
							results = [];
						}

						// Calculate summary from actual results
						const total = results.length;
						const successful = results.filter(
							(r) => r.status === 'success' || r.status === 'already_exists',
						).length;
						const failed = total - successful;

						console.log(
							`Supervision store - Total: ${total}, Successful: ${successful}, Failed: ${failed}`,
						);

						// Don't show notifications here - let the calling store handle it
						// This prevents duplicate notifications

						// Return normalized response
						return {
							results,
							summary: {
								total,
								successful,
								failed,
							},
						};
					} else {
						const errorMessage =
							error?.message || 'Failed to assign supervisors';
						set({ lastError: errorMessage, bulkAssigning: false });
						// Don't show notification here - let calling store handle it
						return null;
					}
				} catch (err) {
					const { message } = handleApiError(
						err,
						'Failed to assign supervisors',
					);
					set({ lastError: message, bulkAssigning: false });
					// Don't show notification here - let calling store handle it
					return null;
				}
			},
		}),
		{
			name: 'supervision-store',
		},
	),
);
