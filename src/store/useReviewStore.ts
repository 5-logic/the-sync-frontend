import { create } from 'zustand';

import {
	AssignBulkReviewersDto,
	AssignBulkReviewersResult,
	ChangeReviewerDto,
	ChangeReviewerResult,
	Lecturer,
	reviewService,
} from '@/lib/services/review.service';
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
		try {
			const res = await reviewService.assignBulkReviewers(dto);
			if (res.success && res.data) {
				// Don't show notification here as it's handled in the component
				return res.data;
			} else {
				// Handle error response - res is the error case with { success: false, statusCode: number, error: string }
				const errorResponse = res as {
					success: false;
					statusCode: number;
					error: string;
				};
				throw new Error(errorResponse.error || 'Failed to assign reviewers');
			}
		} catch (error) {
			// Check if it's an axios error with response data
			if (error && typeof error === 'object' && 'response' in error) {
				const axiosError = error as {
					response?: { data?: { error?: string } };
				};
				if (axiosError.response?.data?.error) {
					// Extract the actual backend error message
					throw new Error(axiosError.response.data.error);
				}
			}

			// If it's already an Error object, re-throw it
			if (error instanceof Error) {
				throw error;
			}
			// Handle other types of errors (network, etc.)
			throw new Error('Failed to assign reviewers');
		}
	},

	async changeReviewer(submissionId, dto) {
		try {
			const res = await reviewService.changeReviewer(submissionId, dto);
			if (res.success && res.data) {
				// Don't show notification here as it's handled in the component
				return res.data;
			} else {
				// Handle error response - res is the error case with { success: false, statusCode: number, error: string }
				const errorResponse = res as {
					success: false;
					statusCode: number;
					error: string;
				};
				throw new Error(errorResponse.error || 'Failed to change reviewer');
			}
		} catch (error) {
			// Check if it's an axios error with response data
			if (error && typeof error === 'object' && 'response' in error) {
				const axiosError = error as {
					response?: { data?: { error?: string } };
				};
				if (axiosError.response?.data?.error) {
					// Extract the actual backend error message
					throw new Error(axiosError.response.data.error);
				}
			}

			// If it's already an Error object, re-throw it
			if (error instanceof Error) {
				throw error;
			}
			// Handle other types of errors (network, etc.)
			throw new Error('Failed to change reviewer');
		}
	},
}));
