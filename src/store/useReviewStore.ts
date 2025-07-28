import { create } from 'zustand';

import {
	AssignBulkReviewersDto,
	AssignBulkReviewersResult,
	ChangeReviewerDto,
	ChangeReviewerResult,
	Lecturer,
	reviewService,
} from '@/lib/services/review.service';
import { showNotification } from '@/lib/utils';
import { cacheUtils } from '@/store/helpers/cacheHelpers';

export interface ReviewStoreState {
	getEligibleReviewers: (
		submissionId: string,
		force?: boolean,
	) => Promise<Lecturer[]>;
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
cacheUtils.initCache<Lecturer[]>('eligibleReviewers', {
	ttl: 10 * 60 * 1000, // 10 minutes
	maxSize: 1000,
	enableLocalStorage: true,
});

export const useReviewStore = create<ReviewStoreState>(() => ({
	async getEligibleReviewers(submissionId: string, force = false) {
		if (!force) {
			const cached = cacheUtils.get<Lecturer[]>(
				'eligibleReviewers',
				submissionId,
			);
			if (cached) return cached;
		}

		try {
			console.log('Fetching eligible reviewers for submission:', submissionId);
			const res = await reviewService.getEligibleReviewers(submissionId);
			console.log('API Response:', res);

			// Check if response is successful
			if (!res.success) {
				console.error('API returned error:', res);
				return [];
			}

			// Check if data exists
			if (!res.data || !Array.isArray(res.data)) {
				console.error('API returned invalid data:', res.data);
				return [];
			}

			// Map the API response to the expected Lecturer format
			const mappedData: Lecturer[] = res.data.map((item) => ({
				id: item.userId,
				fullName: item.user.fullName,
				email: item.user.email,
				isModerator: item.isModerator,
			}));

			console.log('Mapped data:', mappedData);
			cacheUtils.set('eligibleReviewers', submissionId, mappedData);
			return mappedData;
		} catch (error) {
			console.error('Error fetching eligible reviewers:', error);
			return [];
		}
	},

	clearEligibleReviewersCache() {
		cacheUtils.clear('eligibleReviewers');
	},

	async assignBulkReviewers(dto) {
		const res = await reviewService.assignBulkReviewers(dto);
		if (res.success && res.data) {
			showNotification.success('Success', 'Reviewers assigned successfully');
			return res.data;
		} else {
			showNotification.error('Failed', 'Failed to assign reviewers');
			return null;
		}
	},

	async changeReviewer(submissionId, dto) {
		const res = await reviewService.changeReviewer(submissionId, dto);
		if (res.success && res.data) {
			showNotification.success('Success', 'Reviewer changed successfully');
			return res.data;
		} else {
			showNotification.error('Failed', 'Failed to change reviewer');
			return null;
		}
	},
}));
