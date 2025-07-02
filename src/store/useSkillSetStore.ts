import { create } from 'zustand';

import { SkillSetsService } from '@/lib/services/skill-sets.service';
import type { SkillSet } from '@/schemas/skill';

interface SkillSetState {
	skillSets: SkillSet[];
	loading: boolean;
	error: string | null;

	// Actions
	fetchSkillSets: () => Promise<void>;
	setError: (error: string | null) => void;
	clearError: () => void;
}

export const useSkillSetStore = create<SkillSetState>((set, get) => ({
	skillSets: [],
	loading: false,
	error: null,

	fetchSkillSets: async () => {
		const { skillSets } = get();

		// Don't fetch if already have data
		if (skillSets.length > 0) {
			return;
		}

		set({ loading: true, error: null });

		try {
			const data = await SkillSetsService.getAll();
			set({ skillSets: data, loading: false });
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Unknown error';
			set({ error: errorMessage, loading: false });
		}
	},

	setError: (error: string | null) => set({ error }),

	clearError: () => set({ error: null }),
}));
