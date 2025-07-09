import { create } from 'zustand';

import ResponsibilitiesService from '@/lib/services/responsibilities.service';
import type { Responsibility } from '@/schemas/responsibility';

interface ResponsibilityState {
	responsibilities: Responsibility[];
	loading: boolean;
	error: string | null;

	// Actions
	fetchResponsibilities: () => Promise<void>;
	setError: (error: string | null) => void;
	clearError: () => void;
}

export const useResponsibilityStore = create<ResponsibilityState>(
	(set, get) => ({
		responsibilities: [],
		loading: false,
		error: null,

		fetchResponsibilities: async () => {
			const { responsibilities } = get();

			// Don't fetch if already have data
			if (responsibilities.length > 0) {
				return;
			}

			set({ loading: true, error: null });

			try {
				const response = await ResponsibilitiesService.getAll();

				if (response.success) {
					set({ responsibilities: response.data, loading: false });
				} else {
					set({ error: response.error, loading: false });
				}
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : 'Unknown error';
				set({ error: errorMessage, loading: false });
			}
		},

		setError: (error: string | null) => set({ error }),

		clearError: () => set({ error: null }),
	}),
);
