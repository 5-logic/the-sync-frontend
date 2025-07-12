import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import supervisionService, {
	type AssignSupervisorRequest,
	type ChangeSupervisorRequest,
	type Supervision,
} from '@/lib/services/supervisions.service';
import { handleApiError, handleApiResponse } from '@/lib/utils/handleApi';
import { showNotification } from '@/lib/utils/notification';

interface SupervisionState {
	// Data
	supervisions: Supervision[];

	// Loading states
	loading: boolean;
	assigning: boolean;
	changing: boolean;

	// Error states
	lastError: string | null;

	// Actions
	getByThesisId: (thesisId: string) => Promise<Supervision[]>;
	assignSupervisor: (
		thesisId: string,
		data: AssignSupervisorRequest,
	) => Promise<boolean>;
	changeSupervisor: (
		thesisId: string,
		data: ChangeSupervisorRequest,
	) => Promise<boolean>;
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
						showNotification.success(
							'Success',
							'Supervisor assigned successfully',
						);
						return true;
					} else {
						const errorMessage =
							error?.message || 'Failed to assign supervisor';
						set({ lastError: errorMessage, assigning: false });
						showNotification.error('Error', errorMessage);
						return false;
					}
				} catch (err) {
					const { message } = handleApiError(
						err,
						'Failed to assign supervisor',
					);
					set({ lastError: message, assigning: false });
					showNotification.error('Error', message);
					return false;
				}
			},

			// Change supervisor
			changeSupervisor: async (
				thesisId: string,
				data: ChangeSupervisorRequest,
			) => {
				set({ changing: true, lastError: null });

				try {
					const response = await supervisionService.changeSupervisor(
						thesisId,
						data,
					);
					const { success, error } = handleApiResponse(response);

					if (success) {
						set({ changing: false });
						showNotification.success(
							'Success',
							'Supervisor changed successfully',
						);
						return true;
					} else {
						const errorMessage =
							error?.message || 'Failed to change supervisor';
						set({ lastError: errorMessage, changing: false });
						showNotification.error('Error', errorMessage);
						return false;
					}
				} catch (err) {
					const { message } = handleApiError(
						err,
						'Failed to change supervisor',
					);
					set({ lastError: message, changing: false });
					showNotification.error('Error', message);
					return false;
				}
			},

			// Clear error
			clearError: () => set({ lastError: null }),
		}),
		{
			name: 'supervision-store',
		},
	),
);
