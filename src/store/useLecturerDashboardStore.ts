import { create } from 'zustand';

import groupsService from '@/lib/services/groups.service';
import milestoneService from '@/lib/services/milestones.service';
import thesesService from '@/lib/services/theses.service';
import { handleApiResponse } from '@/lib/utils/handleApi';
import type { Milestone } from '@/schemas/milestone';

interface DashboardStats {
	totalThesis: number;
	activeGroups: number;
	pendingMilestones: number;
}

interface LecturerDashboardState {
	// Stats data
	stats: DashboardStats;

	// Loading states
	loading: boolean;
	totalThesisLoading: boolean;
	activeGroupsLoading: boolean;
	pendingMilestonesLoading: boolean;

	// Error states
	error: string | null;

	// Actions
	fetchStats: (lecturerId: string, semesterId: string) => Promise<void>;
	fetchTotalThesis: (lecturerId: string) => Promise<void>;
	fetchActiveGroups: (semesterId: string) => Promise<void>;
	fetchPendingMilestones: (semesterId: string) => Promise<void>;
	reset: () => void;
}

const initialStats: DashboardStats = {
	totalThesis: 0,
	activeGroups: 0,
	pendingMilestones: 0,
};

export const useLecturerDashboardStore = create<LecturerDashboardState>(
	(set, get) => ({
		// Initial state
		stats: initialStats,
		loading: false,
		totalThesisLoading: false,
		activeGroupsLoading: false,
		pendingMilestonesLoading: false,
		error: null,

		// Fetch all stats
		fetchStats: async (lecturerId: string, semesterId: string) => {
			set({ loading: true, error: null });

			try {
				await Promise.all([
					get().fetchTotalThesis(lecturerId),
					get().fetchActiveGroups(semesterId),
					get().fetchPendingMilestones(semesterId),
				]);
			} catch (error) {
				console.error('Error fetching dashboard stats:', error);
				set({ error: 'Failed to fetch dashboard statistics' });
			} finally {
				set({ loading: false });
			}
		},

		// Fetch total thesis topics
		fetchTotalThesis: async (lecturerId: string) => {
			set({ totalThesisLoading: true });

			try {
				const response = await thesesService.findByLecturerId(lecturerId);
				const result = handleApiResponse(response);

				if (result.success) {
					const totalThesis = result.data?.length || 0;
					set((state) => ({
						stats: { ...state.stats, totalThesis },
						totalThesisLoading: false,
					}));
				} else {
					throw new Error('Failed to fetch thesis data');
				}
			} catch (error) {
				console.error('Error fetching total thesis:', error);
				set({ totalThesisLoading: false });
				throw error;
			}
		},

		// Fetch active groups
		fetchActiveGroups: async (semesterId: string) => {
			set({ activeGroupsLoading: true });

			try {
				const response =
					await groupsService.findSuperviseGroupsBySemester(semesterId);
				const result = handleApiResponse(response);

				if (result.success) {
					const activeGroups = result.data?.length || 0;
					set((state) => ({
						stats: { ...state.stats, activeGroups },
						activeGroupsLoading: false,
					}));
				} else {
					throw new Error('Failed to fetch groups data');
				}
			} catch (error) {
				console.error('Error fetching active groups:', error);
				set({ activeGroupsLoading: false });
				throw error;
			}
		},

		// Fetch pending milestones
		fetchPendingMilestones: async (semesterId: string) => {
			set({ pendingMilestonesLoading: true });

			try {
				const response = await milestoneService.findBySemester(semesterId);
				const result = handleApiResponse(response);

				if (result.success) {
					// Filter out expired milestones (only count milestones that haven't ended yet)
					const currentDate = new Date();
					const activeMilestones =
						result.data?.filter((milestone: Milestone) => {
							const endDate = new Date(milestone.endDate);
							return endDate >= currentDate;
						}) || [];

					const pendingMilestones = activeMilestones.length;
					set((state) => ({
						stats: { ...state.stats, pendingMilestones },
						pendingMilestonesLoading: false,
					}));
				} else {
					throw new Error('Failed to fetch milestones data');
				}
			} catch (error) {
				console.error('Error fetching pending milestones:', error);
				set({ pendingMilestonesLoading: false });
				throw error;
			}
		},

		// Reset store
		reset: () => {
			set({
				stats: initialStats,
				loading: false,
				totalThesisLoading: false,
				activeGroupsLoading: false,
				pendingMilestonesLoading: false,
				error: null,
			});
		},
	}),
);
