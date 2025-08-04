import httpClient from "@/lib/services/_httpClient";
import { ApiResponse } from "@/schemas/_common";

// Interfaces from review.service.ts
export interface ReviewerAssignment {
	lecturerId: string;
	isMainReviewer: boolean;
}

export interface AssignBulkReviewerAssignment {
	submissionId: string;
	reviewerAssignments: ReviewerAssignment[];
}

export interface AssignBulkReviewersDto {
	assignments: AssignBulkReviewerAssignment[];
}

export interface AssignBulkReviewersResult {
	totalAssignedCount: number;
	submissionCount: number;
	results: Array<{
		submissionId: string;
		assignedCount: number;
		lecturerIds: string[];
	}>;
}

export interface Lecturer {
	id: string;
	fullName: string;
	email: string;
	isModerator: boolean;
}

export interface EligibleReviewerResponse {
	userId: string;
	isModerator: boolean;
	user: {
		id: string;
		fullName: string;
		email: string;
		password: string;
		gender: string;
		phoneNumber: string;
		isActive: boolean;
		createdAt: string;
		updatedAt: string;
	};
}

export type GetEligibleReviewersResult = EligibleReviewerResponse[];

export type ReviewAcceptance = "Yes" | "No" | "NotAvailable";

export interface ReviewSubmission {
	id: string;
	groupId: string;
	milestoneId: string;
	documents: string[];
	status: string;
	createdAt: string;
	updatedAt: string;
	group: {
		id: string;
		code: string;
		name: string;
		projectDirection: string;
		semesterId: string;
		thesisId: string;
		createdAt: string;
		updatedAt: string;
		thesis: {
			id: string;
			englishName: string;
			vietnameseName: string;
			abbreviation: string;
			description: string;
			domain: string;
			status: string;
			isPublish: boolean;
			groupId: string;
			lecturerId: string;
			semesterId: string;
			createdAt: string;
			updatedAt: string;
		};
		studentGroupParticipations: {
			studentId: string;
			groupId: string;
			semesterId: string;
			isLeader: boolean;
			student: {
				userId: string;
				studentCode: string;
				majorId: string;
				user: {
					id: string;
					fullName: string;
					email: string;
					password: string;
					gender: string;
					phoneNumber: string;
					isActive: boolean;
					createdAt: string;
					updatedAt: string;
				};
				major: {
					id: string;
					name: string;
					code: string;
					createdAt: string;
					updatedAt: string;
				};
			};
		}[];
	};
	milestone: {
		id: string;
		name: string;
		startDate: string;
		endDate: string;
		semesterId: string;
		note: string;
		documents: string[];
		createdAt: string;
		updatedAt: string;
	};
	assignmentReviews: AssignmentReviewer[];
	reviews: Record<string, unknown>[];
}

export interface AssignedReview {
	reviewerId: string;
	submissionId: string;
	isMainReviewer: boolean;
	submission: ReviewSubmission;
}

export interface AssignmentReviewer {
	reviewerId: string;
	submissionId: string;
	isMainReviewer: boolean;
	reviewer: {
		userId: string;
		isModerator: boolean;
		user: {
			id: string;
			fullName: string;
			email: string;
		};
	};
}

class ReviewsService {
	private readonly baseUrl = "/reviews";

	/**
	 * Get assigned reviews for lecturer
	 */
	async getAssignedReviews(): Promise<ApiResponse<AssignedReview[]>> {
		const response = await httpClient.get<ApiResponse<AssignedReview[]>>(
			`${this.baseUrl}/assigned`,
		);
		return response.data;
	}

	/**
	 * Get review form for submission
	 */
	async getReviewForm(
		submissionId: string,
	): Promise<ApiResponse<ReviewFormData>> {
		const response = await httpClient.get<ApiResponse<ReviewFormData>>(
			`${this.baseUrl}/${submissionId}/form`,
		);
		return response.data;
	}

	/**
	 * Submit review for submission
	 */
	async submitReview(
		submissionId: string,
		reviewData: SubmitReviewRequest,
	): Promise<ApiResponse<SubmittedReview>> {
		const response = await httpClient.post<ApiResponse<SubmittedReview>>(
			`${this.baseUrl}/${submissionId}`,
			reviewData,
		);
		return response.data;
	}

	/**
	 * Get all reviews for a submission
	 */
	async getSubmissionReviews(
		submissionId: string,
	): Promise<ApiResponse<SubmissionReviewWithReviewer[]>> {
		const response = await httpClient.get<
			ApiResponse<SubmissionReviewsResponse>
		>(`${this.baseUrl}/submissions/${submissionId}/reviews`);

		// Transform the new API response to match the expected format
		if (response.data.success && response.data.data) {
			const { assignmentReviews, reviews } = response.data.data;

			// Create a map of reviewers by their ID for quick lookup
			const reviewerMap = new Map(
				assignmentReviews.map((assignment) => [
					assignment.reviewerId,
					{
						reviewer: assignment.reviewer,
						isMainReviewer: assignment.isMainReviewer,
					},
				]),
			);

			// Merge reviews with reviewer information
			const mergedReviews: SubmissionReviewWithReviewer[] = reviews.map(
				(review) => {
					const reviewerInfo = reviewerMap.get(review.lecturerId);
					return {
						...review,
						lecturer: reviewerInfo?.reviewer || {
							userId: review.lecturerId,
							isModerator: false,
							user: {
								id: review.lecturerId,
								fullName: "Unknown Reviewer",
								email: "",
								password: "",
								gender: "",
								phoneNumber: "",
								isActive: true,
								createdAt: "",
								updatedAt: "",
							},
						},
						isMainReviewer: reviewerInfo?.isMainReviewer || false,
					};
				},
			);

			return {
				...response.data,
				data: mergedReviews,
			};
		}

		return response.data as ApiResponse<SubmissionReviewWithReviewer[]>;
	}

	/**
	 * Update an existing review
	 */
	async updateReview(
		reviewId: string,
		reviewData: UpdateReviewRequest,
	): Promise<ApiResponse<SubmittedReview>> {
		const response = await httpClient.put<ApiResponse<SubmittedReview>>(
			`${this.baseUrl}/${reviewId}`,
			reviewData,
		);
		return response.data;
	}

	/**
	 * Get eligible reviewers for a submission (returns lecturer details)
	 */
	async getEligibleReviewers(
		submissionId: string,
	): Promise<ApiResponse<GetEligibleReviewersResult>> {
		const response = await httpClient.get<
			ApiResponse<GetEligibleReviewersResult>
		>(`${this.baseUrl}/${submissionId}/eligible-reviewers`);
		// BE returns array of eligible reviewers
		return response.data;
	}

	/**
	 * Assign reviewers to multiple submissions (returns { totalAssignedCount, submissionCount, results })
	 */
	async assignBulkReviewers(
		dto: AssignBulkReviewersDto,
	): Promise<ApiResponse<AssignBulkReviewersResult>> {
		const response = await httpClient.post<
			ApiResponse<AssignBulkReviewersResult>
		>(`${this.baseUrl}/assign-reviewer`, dto);
		// BE returns { totalAssignedCount, submissionCount, results }
		return response.data;
	}
}

export interface ReviewFormData {
	id: string;
	groupId: string;
	milestoneId: string;
	documents: string[];
	status: string;
	createdAt: string;
	updatedAt: string;
	group: {
		id: string;
		code: string;
		name: string;
		projectDirection: string;
		semesterId: string;
		thesisId: string;
		createdAt: string;
		updatedAt: string;
	};
	milestone: {
		id: string;
		name: string;
		startDate: string;
		endDate: string;
		semesterId: string;
		note: string;
		documents: string[];
		createdAt: string;
		updatedAt: string;
		checklist: {
			id: string;
			name: string;
			description: string;
			milestoneId: string;
			createdAt: string;
			updatedAt: string;
			checklistItems: {
				id: string;
				name: string;
				description: string;
				isRequired: boolean;
				checklistId: string;
				createdAt: string;
				updatedAt: string;
			}[];
		};
	};
}

export interface SubmitReviewRequest {
	checklistId: string;
	feedback: string;
	reviewItems: {
		checklistItemId: string;
		acceptance: ReviewAcceptance;
		note?: string;
	}[];
}

export interface UpdateReviewRequest {
	feedback: string;
	reviewItems: {
		checklistItemId: string;
		acceptance: ReviewAcceptance;
		note?: string;
	}[];
}

export interface SubmissionReview {
	id: string;
	feedback: string;
	lecturerId: string;
	checklistId: string;
	submissionId: string;
	createdAt: string;
	updatedAt: string;
	reviewItems: {
		reviewId: string;
		checklistItemId: string;
		acceptance: ReviewAcceptance;
		note?: string;
		checklistItem: {
			id: string;
			name: string;
			description: string;
			isRequired: boolean;
			checklistId: string;
			createdAt: string;
			updatedAt: string;
		};
	}[];
	checklist: {
		id: string;
		name: string;
		description: string;
		milestoneId: string;
		createdAt: string;
		updatedAt: string;
	};
}

export interface SubmissionReviewsResponse {
	assignmentReviews: {
		reviewerId: string;
		submissionId: string;
		isMainReviewer: boolean;
		reviewer: {
			userId: string;
			isModerator: boolean;
			user: {
				id: string;
				fullName: string;
				email: string;
				password: string;
				gender: string;
				phoneNumber: string;
				isActive: boolean;
				createdAt: string;
				updatedAt: string;
			};
		};
	}[];
	reviews: SubmissionReview[];
}

// Enhanced interface with reviewer info for backward compatibility
export interface SubmissionReviewWithReviewer extends SubmissionReview {
	lecturer: {
		userId: string;
		isModerator: boolean;
		user: {
			id: string;
			fullName: string;
			email: string;
			password: string;
			gender: string;
			phoneNumber: string;
			isActive: boolean;
			createdAt: string;
			updatedAt: string;
		};
	};
	isMainReviewer: boolean;
}

// Type alias for backward compatibility
export type SubmissionReviewLegacy = SubmissionReviewWithReviewer;

export interface SubmittedReview {
	id: string;
	checklistId: string;
	submissionId: string;
	lecturerId: string;
	feedback: string;
	createdAt: string;
	updatedAt: string;
	reviewItems: {
		id: string;
		reviewId: string;
		checklistItemId: string;
		acceptance: ReviewAcceptance;
		note?: string;
		createdAt: string;
		updatedAt: string;
	}[];
}

export const reviewsService = new ReviewsService();
export const reviewService = reviewsService; // Alias for backward compatibility
export default reviewsService;
