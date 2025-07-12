import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import groupService from '@/lib/services/groups.service';
import lecturerService from '@/lib/services/lecturers.service';
import supervisionService, {
	type Supervision,
} from '@/lib/services/supervisions.service';
import thesesService from '@/lib/services/theses.service';
import { handleApiError, handleApiResponse } from '@/lib/utils/handleApi';
import { showNotification } from '@/lib/utils/notification';
import { GroupService as Group } from '@/schemas/group';
import { type Lecturer } from '@/schemas/lecturer';
import { useSupervisionStore } from '@/store/useSupervisionStore';

export interface SupervisorAssignmentData {
	id: string;
	thesisTitle: string;
	groupName: string;
	memberCount: number;
	supervisors: string[];
	supervisorDetails: Array<{
		id: string;
		fullName: string;
		email: string;
	}>;
	status: 'Finalized' | 'Incomplete' | 'Unassigned';
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

	// Error states
	lastError: string | null;

	// Helper functions
	determineStatus: (
		supervisions: Supervision[],
	) => 'Finalized' | 'Incomplete' | 'Unassigned';

	// Actions
	fetchData: () => Promise<void>;
	assignSupervisor: (thesisId: string, lecturerId: string) => Promise<boolean>;
	changeSupervisor: (
		thesisId: string,
		currentSupervisorId: string,
		newSupervisorId: string,
	) => Promise<boolean>;
	refreshData: () => Promise<void>;
	clearError: () => void;
}

export const useAssignSupervisorStore = create<AssignSupervisorState>()(
	devtools(
		(set, get) => ({
			// Initial state
			data: [],
			lecturers: [],
			loading: false,
			refreshing: false,
			lastError: null,

			// Determine status based on supervision count
			determineStatus: (
				supervisions: Supervision[],
			): 'Finalized' | 'Incomplete' | 'Unassigned' => {
				const supervisionCount = supervisions.length;
				if (supervisionCount === 2) return 'Finalized';
				if (supervisionCount === 1) return 'Incomplete';
				return 'Unassigned';
			},

			// Fetch all data
			fetchData: async () => {
				set({ loading: true, lastError: null });

				try {
					const [thesesResponse, lecturersResponse] = await Promise.all([
						thesesService.findAll(),
						lecturerService.findAll(),
					]);

					const thesesResult = handleApiResponse(thesesResponse);
					const lecturersResult = handleApiResponse(lecturersResponse);

					if (!thesesResult.success) {
						throw new Error(
							thesesResult.error?.message || 'Failed to fetch theses',
						);
					}

					if (!lecturersResult.success) {
						throw new Error(
							lecturersResult.error?.message || 'Failed to fetch lecturers',
						);
					}

					set({ lecturers: lecturersResult.data || [] });

					// Process each thesis
					const thesesWithData = await Promise.all(
						(thesesResult.data || []).map(async (thesis) => {
							const supervisionPromise = supervisionService.getByThesisId(
								thesis.id,
							);
							const groupPromise = thesis.groupId
								? groupService.findOne(thesis.groupId)
								: Promise.resolve(null);

							const [supervisionResult, groupResult] = await Promise.allSettled(
								[supervisionPromise, groupPromise],
							);

							// Process supervision data
							let supervisions: Supervision[] = [];
							let supervisorDetails: Array<{
								id: string;
								fullName: string;
								email: string;
							}> = [];

							if (
								supervisionResult.status === 'fulfilled' &&
								supervisionResult.value.success
							) {
								supervisions = supervisionResult.value.data;

								// Fetch lecturer details
								const lecturerPromises = supervisions.map((supervision) =>
									lecturerService.findOne(supervision.lecturerId),
								);

								const lecturerResults =
									await Promise.allSettled(lecturerPromises);

								supervisorDetails = [];
								for (const result of lecturerResults) {
									if (result.status === 'fulfilled' && result.value.success) {
										supervisorDetails.push({
											id: result.value.data.id,
											fullName: result.value.data.fullName,
											email: result.value.data.email,
										});
									}
								}
							}

							// Process group data
							let groupName = 'No Group';
							let memberCount = 0;
							let groupId: string | null = null;

							if (
								groupResult.status === 'fulfilled' &&
								groupResult.value &&
								groupResult.value.success
							) {
								const group = groupResult.value.data as Group & {
									members?: Array<{
										userId: string;
										user: { fullName: string };
										isLeader: boolean;
									}>;
								};
								groupName = group.name;
								groupId = group.id;

								if (group.members && Array.isArray(group.members)) {
									memberCount = group.members.length;
								}
							}

							const status = get().determineStatus(supervisions);
							const supervisorNames = supervisorDetails.map((s) => s.fullName);

							return {
								id: thesis.id,
								thesisTitle: thesis.englishName,
								groupName,
								memberCount,
								supervisors: supervisorNames,
								supervisorDetails,
								status,
								thesisId: thesis.id,
								groupId,
							};
						}),
					);

					set({ data: thesesWithData, loading: false });
				} catch (err) {
					const { message } = handleApiError(
						err,
						'Failed to fetch assign supervisor data',
					);
					set({ lastError: message, loading: false });
					showNotification.error('Error', message);
				}
			},

			// Assign supervisor
			assignSupervisor: async (thesisId: string, lecturerId: string) => {
				const supervisionStore = useSupervisionStore.getState();
				const success = await supervisionStore.assignSupervisor(thesisId, {
					lecturerId,
				});

				if (success) {
					await get().refreshData();
				}

				return success;
			},

			// Change supervisor
			changeSupervisor: async (
				thesisId: string,
				currentSupervisorId: string,
				newSupervisorId: string,
			) => {
				const supervisionStore = useSupervisionStore.getState();
				const success = await supervisionStore.changeSupervisor(thesisId, {
					currentSupervisorId,
					newSupervisorId,
				});

				if (success) {
					await get().refreshData();
				}

				return success;
			},

			// Refresh data
			refreshData: async () => {
				set({ refreshing: true });
				await get().fetchData();
				set({ refreshing: false });
			},

			// Clear error
			clearError: () => set({ lastError: null }),
		}),
		{
			name: 'assign-supervisor-store',
		},
	),
);
