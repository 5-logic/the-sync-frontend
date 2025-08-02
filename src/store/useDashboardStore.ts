import { create } from 'zustand';

import {
	DashboardService,
	DashboardStatistics,
	ProgressOverview,
	SummaryCard,
	SupervisorLoadDistribution,
} from '@/lib/services/dashboard.service';

interface DashboardState {
	// Data
	statistics: DashboardStatistics | null;
	summaryCard: SummaryCard | null;
	progressOverview: ProgressOverview | null;
	supervisorLoadDistribution: SupervisorLoadDistribution[];

	// UI State
	loading: boolean;
	error: string | null;
	selectedSemesterId: string | null;

	// Actions
	setSelectedSemesterId: (semesterId: string | null) => void;
	fetchDashboardStatistics: (semesterId: string) => Promise<void>;
	clearError: () => void;
	reset: () => void;
}

const initialState = {
	statistics: null,
	summaryCard: null,
	progressOverview: null,
	supervisorLoadDistribution: [],
	loading: false,
	error: null,
	selectedSemesterId: null,
};

export const useDashboardStore = create<DashboardState>()((set, get) => ({
	...initialState,

	setSelectedSemesterId: (semesterId) => {
		set({ selectedSemesterId: semesterId });
		if (semesterId) {
			get().fetchDashboardStatistics(semesterId);
		} else {
			set({
				statistics: null,
				summaryCard: null,
				progressOverview: null,
				supervisorLoadDistribution: [],
			});
		}
	},

	fetchDashboardStatistics: async (semesterId: string) => {
		try {
			set({ loading: true, error: null });

			const statistics =
				await DashboardService.getSemesterStatistics(semesterId);

			set({
				statistics,
				summaryCard: statistics.summaryCard,
				progressOverview: statistics.progressOverview,
				supervisorLoadDistribution: statistics.supervisorLoadDistribution,
				loading: false,
			});
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to fetch dashboard statistics';

			set({
				error: errorMessage,
				loading: false,
				statistics: null,
				summaryCard: null,
				progressOverview: null,
				supervisorLoadDistribution: [],
			});
		}
	},

	clearError: () => set({ error: null }),

	reset: () => set(initialState),
}));
