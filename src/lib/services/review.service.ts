import httpClient from '@/lib/services/_httpClient';
import { ApiResponse } from '@/schemas/_common';

export interface AssignBulkReviewerAssignment {
	submissionId: string;
	lecturerIds: string[];
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

export interface ChangeReviewerDto {
	currentReviewerId: string;
	newReviewerId: string;
}

export interface ChangeReviewerResult {
	reviewerId: string;
	submissionId: string;
}

export interface EligibleReviewer {
	id: string;
	name: string;
	email: string;
	isModerator: boolean;
}

export type GetEligibleReviewersResult = EligibleReviewer[];

class ReviewService {
	private readonly baseUrl = '/reviews';
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
	/**
	 * Change reviewer assignment for a submission (returns updated assignment)
	 */
	async changeReviewer(
		submissionId: string,
		dto: ChangeReviewerDto,
	): Promise<ApiResponse<ChangeReviewerResult>> {
		const response = await httpClient.put<ApiResponse<ChangeReviewerResult>>(
			`${this.baseUrl}/${submissionId}/change-reviewer`,
			dto,
		);
		// BE returns updated assignment
		return response.data;
	}
}

export const reviewService = new ReviewService();
export default reviewService;
