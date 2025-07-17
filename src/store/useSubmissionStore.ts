import { create } from 'zustand';

import submissionService, {
	SubmissionItem,
} from '@/lib/services/submission.service';

interface SubmissionState {
	submissions: SubmissionItem[];
	loading: boolean;
	error: string | null;
	fetchByMilestone: (milestoneId: string) => Promise<SubmissionItem[] | null>;
	clear: () => void;
}

export const useSubmissionStore = create<SubmissionState>((set) => ({
	submissions: [],
	loading: false,
	error: null,
	fetchByMilestone: async (milestoneId: string) => {
		set({ loading: true, error: null });
		try {
			const res = await submissionService.findByMilestone(milestoneId);
			if (res && res.success) {
				set({ submissions: res.data, loading: false });
				return res.data;
			} else {
				set({ error: 'Failed to fetch submissions', loading: false });
				return null;
			}
		} catch (e) {
			set({
				error: e instanceof Error ? e.message : 'Unknown error',
				loading: false,
			});
			return null;
		}
	},
	clear: () => set({ submissions: [], loading: false, error: null }),
}));
