import { useCallback, useState } from "react";

import reviewsService, {
	AssignedReview,
	ReviewFormData,
	SubmissionReviewWithReviewer,
	SubmitReviewRequest,
	SubmittedReview,
	UpdateReviewRequest,
} from "@/lib/services/reviews.service";
import supervisionService from "@/lib/services/supervisions.service";
import { handleApiResponse } from "@/lib/utils/handleApi";
import { handleAsyncError } from "@/lib/utils/errorHandling";

interface Supervisor {
	lecturerId: string;
}

interface UseReviewsReturn {
	reviews: AssignedReview[];
	reviewForm: ReviewFormData | null;
	submissionReviews: SubmissionReviewWithReviewer[];
	loading: boolean;
	reviewFormLoading: boolean;
	submissionReviewsLoading: boolean;
	submitting: boolean;
	error: string | null;
	fetchAssignedReviews: () => Promise<void>;
	fetchReviewForm: (submissionId: string) => Promise<void>;
	fetchSubmissionReviews: (submissionId: string) => Promise<void>;
	submitReview: (
		submissionId: string,
		reviewData: SubmitReviewRequest,
	) => Promise<SubmittedReview | null>;
	updateReview: (
		reviewId: string,
		reviewData: UpdateReviewRequest,
	) => Promise<SubmittedReview | null>;
	getThesisSupervisors: (thesisId: string) => Promise<Supervisor[]>;
	clearReviews: () => void;
	refreshCache: () => void;
}

export function useReviews(): UseReviewsReturn {
	const [reviews, setReviews] = useState<AssignedReview[]>([]);
	const [reviewForm, setReviewForm] = useState<ReviewFormData | null>(null);
	const [submissionReviews, setSubmissionReviews] = useState<
		SubmissionReviewWithReviewer[]
	>([]);
	const [loading, setLoading] = useState(false);
	const [reviewFormLoading, setReviewFormLoading] = useState(false);
	const [submissionReviewsLoading, setSubmissionReviewsLoading] =
		useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchAssignedReviews = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			console.log("🔄 Fetching assigned reviews...");
			const response = await reviewsService.getAssignedReviews();
			const result = handleApiResponse(response);

			if (!result.success) {
				throw new Error(
					result.error?.message || "Failed to fetch assigned reviews",
				);
			}

			const data = result.data || [];
			setReviews(data);

			console.log("✅ Successfully fetched reviews:", data.length);
		} catch (error) {
			const errorMessage = handleAsyncError(
				error,
				"Failed to fetch assigned reviews",
				"fetchAssignedReviews",
			);
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	}, []);

	const getThesisSupervisors = useCallback(
		async (thesisId: string): Promise<Supervisor[]> => {
			try {
				console.log("🔄 Fetching thesis supervisors for:", thesisId);
				const response = await supervisionService.getByThesisId(thesisId);
				const result = handleApiResponse(response);

				if (!result.success) {
					throw new Error(
						result.error?.message || "Failed to fetch thesis supervisors",
					);
				}

				const data = result.data || [];
				console.log("✅ Successfully fetched supervisors:", data.length);
				return data;
			} catch (error) {
				console.error("Error fetching thesis supervisors:", error);
				return [];
			}
		},
		[],
	);

	const fetchReviewForm = useCallback(async (submissionId: string) => {
		try {
			setReviewFormLoading(true);
			setError(null);

			console.log("🔄 Fetching review form for submission:", submissionId);
			const response = await reviewsService.getReviewForm(submissionId);
			const result = handleApiResponse(response);

			if (!result.success) {
				throw new Error(result.error?.message || "Failed to fetch review form");
			}

			setReviewForm(result.data || null);
			console.log("✅ Successfully fetched review form");
		} catch (error) {
			const errorMessage = handleAsyncError(
				error,
				"Failed to fetch review form",
				"fetchReviewForm",
			);
			setError(errorMessage);
		} finally {
			setReviewFormLoading(false);
		}
	}, []);

	const submitReview = useCallback(
		async (
			submissionId: string,
			reviewData: SubmitReviewRequest,
		): Promise<SubmittedReview | null> => {
			try {
				setSubmitting(true);
				setError(null);

				console.log("🔄 Submitting review for submission:", submissionId);
				const response = await reviewsService.submitReview(
					submissionId,
					reviewData,
				);
				const result = handleApiResponse(response);

				if (!result.success) {
					throw new Error(result.error?.message || "Failed to submit review");
				}

				console.log("✅ Successfully submitted review");
				return result.data || null;
			} catch (error) {
				const errorMessage = handleAsyncError(
					error,
					"Failed to submit review",
					"submitReview",
				);
				setError(errorMessage);
				return null;
			} finally {
				setSubmitting(false);
			}
		},
		[],
	);

	const fetchSubmissionReviews = useCallback(async (submissionId: string) => {
		try {
			setSubmissionReviewsLoading(true);
			setError(null);

			console.log("🔄 Fetching submission reviews for:", submissionId);
			const response = await reviewsService.getSubmissionReviews(submissionId);
			const result = handleApiResponse(response);

			if (!result.success) {
				throw new Error(
					result.error?.message || "Failed to fetch submission reviews",
				);
			}

			setSubmissionReviews(result.data || []);
			console.log("✅ Successfully fetched submission reviews");
		} catch (error) {
			const errorMessage = handleAsyncError(
				error,
				"Failed to fetch submission reviews",
				"fetchSubmissionReviews",
			);
			setError(errorMessage);
		} finally {
			setSubmissionReviewsLoading(false);
		}
	}, []);

	const updateReview = useCallback(
		async (
			reviewId: string,
			reviewData: UpdateReviewRequest,
		): Promise<SubmittedReview | null> => {
			try {
				setSubmitting(true);
				setError(null);

				console.log("🔄 Updating review:", reviewId);
				const response = await reviewsService.updateReview(
					reviewId,
					reviewData,
				);
				const result = handleApiResponse(response);

				if (!result.success) {
					throw new Error(result.error?.message || "Failed to update review");
				}

				console.log("✅ Successfully updated review");
				return result.data || null;
			} catch (error) {
				const errorMessage = handleAsyncError(
					error,
					"Failed to update review",
					"updateReview",
				);
				setError(errorMessage);
				return null;
			} finally {
				setSubmitting(false);
			}
		},
		[],
	);

	const clearReviews = useCallback(() => {
		setReviews([]);
		setReviewForm(null);
		setSubmissionReviews([]);
		setError(null);
	}, []);

	const refreshCache = useCallback(() => {
		// Force refresh by clearing cache and refetching
		clearReviews();
	}, [clearReviews]);

	return {
		reviews,
		reviewForm,
		submissionReviews,
		loading,
		reviewFormLoading,
		submissionReviewsLoading,
		submitting,
		error,
		fetchAssignedReviews,
		fetchReviewForm,
		fetchSubmissionReviews,
		submitReview,
		updateReview,
		getThesisSupervisors,
		clearReviews,
		refreshCache,
	};
}
