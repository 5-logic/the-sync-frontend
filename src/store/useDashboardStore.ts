import { create } from 'zustand';

import {
	AIStatisticsData,
	AIStatisticsService,
} from '@/lib/services/ai-statistics.service';
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
	aiStatistics: AIStatisticsData | null;

	// UI State
	loading: boolean;
	aiLoading: boolean;
	error: string | null;
	aiError: string | null;
	selectedSemesterId: string | null;

	// Actions
	setSelectedSemesterId: (semesterId: string | null) => void;
	fetchDashboardStatistics: (semesterId: string) => Promise<void>;
	fetchAIStatistics: (semesterId: string) => Promise<void>;
	clearError: () => void;
	reset: () => void;
}

const initialState = {
	statistics: null,
	summaryCard: null,
	progressOverview: null,
	supervisorLoadDistribution: [],
	aiStatistics: null,
	loading: false,
	aiLoading: false,
	error: null,
	aiError: null,
	selectedSemesterId: null,
};

export const useDashboardStore = create<DashboardState>()((set, get) => ({
	...initialState,

	setSelectedSemesterId: (semesterId) => {
		set({ selectedSemesterId: semesterId });
		if (semesterId) {
			get().fetchDashboardStatistics(semesterId);
			get().fetchAIStatistics(semesterId);
		} else {
			set({
				statistics: null,
				summaryCard: null,
				progressOverview: null,
				supervisorLoadDistribution: [],
				aiStatistics: null,
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

	fetchAIStatistics: async (semesterId: string) => {
		try {
			set({ aiLoading: true, aiError: null });

			const aiStatistics =
				await AIStatisticsService.getSemesterAIStatistics(semesterId);

			set({
				aiStatistics,
				aiLoading: false,
			});
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to fetch AI statistics';

			set({
				aiError: errorMessage,
				aiLoading: false,
				aiStatistics: null,
			});
		}
	},

	clearError: () => set({ error: null, aiError: null }),

	reset: () => set(initialState),
}));
