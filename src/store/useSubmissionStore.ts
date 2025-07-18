import { create } from 'zustand';

import submissionService, {
	SubmissionItem,
} from '@/lib/services/submission.service';
import { cacheInvalidation, cacheUtils } from '@/store/helpers/cacheHelpers';

interface SubmissionState {
	submissions: SubmissionItem[];
	loading: boolean;
	error: string | null;
	lastFetchedMilestoneId: string | null;
	fetchByMilestone: (
		milestoneId: string,
		force?: boolean,
	) => Promise<SubmissionItem[] | null>;
	clear: () => void;
	clearCache: () => void;
}

export const useSubmissionStore = create<SubmissionState>((set, get) => ({
	submissions: [],
	loading: false,
	error: null,
	lastFetchedMilestoneId: null,

	fetchByMilestone: async (milestoneId: string, force = false) => {
		const state = get();

		// Skip if already loading the same milestone and not forced
		if (
			state.loading &&
			state.lastFetchedMilestoneId === milestoneId &&
			!force
		) {
			return state.submissions;
		}

		// Check cache first (unless forced)
		if (!force) {
			const cacheKey = `submission-milestone-${milestoneId}`;
			const cached = cacheUtils.get('submission', cacheKey);

			if (cached && Array.isArray(cached)) {
				set({
					submissions: cached as SubmissionItem[],
					lastFetchedMilestoneId: milestoneId,
					error: null,
				});
				return cached as SubmissionItem[];
			}
		}

		set({ loading: true, error: null, lastFetchedMilestoneId: milestoneId });

		try {
			const res = await submissionService.findByMilestone(milestoneId);
			if (res && res.success) {
				const submissionsData = res.data;

				// Cache the data
				const cacheKey = `submission-milestone-${milestoneId}`;
				cacheUtils.set('submission', cacheKey, submissionsData);

				set({ submissions: submissionsData, loading: false });
				return submissionsData;
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

	clear: () =>
		set({
			submissions: [],
			loading: false,
			error: null,
			lastFetchedMilestoneId: null,
		}),

	clearCache: () => {
		// Clear cache for submission entity
		cacheInvalidation.invalidateEntity('submission');
	},
}));

// Initialize cache for submission entity
cacheUtils.initCache('submission', {
	ttl: 2 * 60 * 1000, // 2 minutes cache for submissions
	maxSize: 50,
	enableLocalStorage: false, // Don't persist submissions to localStorage
});
