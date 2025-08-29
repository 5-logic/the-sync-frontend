import { useCallback, useState } from 'react';

import reviewsService, {
	SubmissionReviewsResponse,
} from '@/lib/services/reviews.service';
import { handleAsyncError } from '@/lib/utils/errorHandling';
import { handleApiResponse } from '@/lib/utils/handleApi';

type AssignedReviewer = SubmissionReviewsResponse['assignmentReviews'][0];

interface UseStudentReviewsReturn {
	assignedReviewers: AssignedReviewer[] | null;
	assignedReviewersLoading: boolean;
	error: string | null;
	fetchAssignedReviewers: (submissionId: string) => Promise<void>;
	clearAssignedReviewers: () => void;
}

export function useStudentReviews(): UseStudentReviewsReturn {
	const [assignedReviewers, setAssignedReviewers] = useState<
		AssignedReviewer[] | null
	>(null);
	const [assignedReviewersLoading, setAssignedReviewersLoading] =
		useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchAssignedReviewers = useCallback(async (submissionId: string) => {
		try {
			setAssignedReviewersLoading(true);
			setError(null);

			const response =
				await reviewsService.getSubmissionAssignmentReviews(submissionId);
			const result = handleApiResponse(response);

			if (!result.success) {
				throw new Error(
					result.error?.message || 'Failed to fetch assigned reviewers',
				);
			}

			// Extract assignmentReviews from the response
			const reviewsData = result.data;
			if (reviewsData?.assignmentReviews) {
				setAssignedReviewers(reviewsData.assignmentReviews || []);
			} else {
				setAssignedReviewers([]);
			}
		} catch (error) {
			const errorMessage = handleAsyncError(
				error,
				'Failed to fetch assigned reviewers',
				'fetchAssignedReviewers',
			);
			setError(errorMessage);
		} finally {
			setAssignedReviewersLoading(false);
		}
	}, []);

	const clearAssignedReviewers = useCallback(() => {
		setAssignedReviewers(null);
		setError(null);
	}, []);

	return {
		assignedReviewers,
		assignedReviewersLoading,
		error,
		fetchAssignedReviewers,
		clearAssignedReviewers,
	};
}
