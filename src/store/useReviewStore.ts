import { create } from 'zustand';

import {
	AssignBulkReviewersDto,
	AssignBulkReviewersResult,
	ChangeReviewerDto,
	ChangeReviewerResult,
	EligibleReviewer,
	reviewService,
} from '@/lib/services/review.service';
import { cacheUtils } from '@/store/helpers/cacheHelpers';

export interface ReviewStoreState {
	getEligibleReviewers: (
		submissionId: string,
		force?: boolean,
	) => Promise<EligibleReviewer[]>;
	clearEligibleReviewersCache: () => void;
	// Placeholders for future review service methods
	assignBulkReviewers?: (
		dto: AssignBulkReviewersDto,
	) => Promise<AssignBulkReviewersResult | null>;
	changeReviewer?: (
		submissionId: string,
		dto: ChangeReviewerDto,
	) => Promise<ChangeReviewerResult | null>;
}

// Initialize cache for eligible reviewers
cacheUtils.initCache<EligibleReviewer[]>('eligibleReviewers', {
	ttl: 10 * 60 * 1000, // 10 minutes
	maxSize: 1000,
	enableLocalStorage: true,
});

export const useReviewStore = create<ReviewStoreState>(() => ({
	async getEligibleReviewers(submissionId: string, force = false) {
		if (!force) {
			const cached = cacheUtils.get<EligibleReviewer[]>(
				'eligibleReviewers',
				submissionId,
			);
			if (cached) return cached;
		}
		const res = await reviewService.getEligibleReviewers(submissionId);
		const data = res.success && res.data ? res.data : [];
		cacheUtils.set('eligibleReviewers', submissionId, data);
		return data;
	},

	clearEligibleReviewersCache() {
		cacheUtils.clear('eligibleReviewers');
	},

	async assignBulkReviewers(dto) {
		const res = await reviewService.assignBulkReviewers(dto);
		return res.success && res.data ? res.data : null;
	},

	async changeReviewer(submissionId, dto) {
		const res = await reviewService.changeReviewer(submissionId, dto);
		return res.success && res.data ? res.data : null;
	},
}));
