import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import groupService from '@/lib/services/groups.service';
import { GroupDashboard } from '@/schemas/group';

interface GroupDashboardState {
	group: GroupDashboard | null;
	loading: boolean;
	error: string | null;
	lastFetched: number | null; // Timestamp for cache invalidation
	fetchStudentGroup: (forceRefresh?: boolean) => Promise<void>;
	clearGroup: () => void;
	refreshGroup: () => Promise<void>;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export const useGroupDashboardStore = create<GroupDashboardState>()(
	persist(
		(set, get) => ({
			group: null,
			loading: false,
			error: null,
			lastFetched: null,

			fetchStudentGroup: async (forceRefresh = false) => {
				const state = get();
				const now = Date.now();

				// Check if we have cached data (either group or null) and it's still fresh
				const isCacheValid =
					state.lastFetched && now - state.lastFetched < CACHE_DURATION;

				if (!forceRefresh && isCacheValid) {
					// Return cached data without making API call
					return;
				}

				// Prevent multiple simultaneous fetches
				if (state.loading) {
					return;
				}

				try {
					set({ loading: true, error: null });
					const response = await groupService.getStudentGroup();

					if (response.success && response.data.length > 0) {
						// Student should only have one group, take the first one
						set({
							group: response.data[0],
							loading: false,
							lastFetched: now,
						});
					} else {
						set({
							group: null,
							loading: false,
							lastFetched: now,
						});
					}
				} catch (error) {
					console.error('Error fetching group:', error);
					set({
						error:
							error instanceof Error ? error.message : 'Failed to fetch group',
						loading: false,
						lastFetched: null,
					});
				}
			},

			refreshGroup: async () => {
				const { fetchStudentGroup } = get();
				await fetchStudentGroup(true); // Force refresh
			},

			clearGroup: () => {
				set({
					group: null,
					error: null,
					lastFetched: null,
					loading: false, // Reset loading state to prevent stuck loading
				});
			},
		}),
		{
			name: 'group-dashboard-storage',
			// Only persist the group data and lastFetched, not loading/error states
			partialize: (state) => ({
				group: state.group,
				lastFetched: state.lastFetched,
			}),
		},
	),
);
