import httpClient from '@/lib/services/_httpClient';
import { ApiResponse } from '@/schemas/_common';
import { SubmissionDetail } from '@/schemas/submission';

// API response interfaces for milestone submissions list
export interface SubmissionGroup {
	id: string;
	name: string;
	code: string;
}

export interface SubmissionMilestone {
	id: string;
	name: string;
}

export interface SubmissionLecturer {
	id: string;
	fullName: string;
	email: string;
	isModerator: boolean;
}

export interface SubmissionThesis {
	id: string;
	englishName: string;
	vietnameseName: string;
	abbreviation: string;
	description: string;
	status: string;
	supervisors: SubmissionLecturer[];
}

export interface SubmissionItem {
	id: string;
	status: 'Submitted' | 'NotSubmitted';
	documents: string[];
	createdAt: string;
	group: SubmissionGroup;
	milestone: SubmissionMilestone;
	thesis: SubmissionThesis;
	reviewLecturers: SubmissionLecturer[];
}

export interface SubmissionDetailResponse {
	success: boolean;
	statusCode: number;
	data: {
		submission: SubmissionItem & {
			updatedAt?: string;
		};
		group: SubmissionGroup & {
			semester?: {
				id: string;
				name: string;
				code: string;
				status: string;
			};
			thesis?: SubmissionThesis;
			supervisors?: SubmissionLecturer[];
		};
		reviewers: Array<{
			id: string;
			name: string;
			email: string;
			isModerator: boolean;
		}>;
	};
}

/**
 * Submission Service
 * Handles submission-related API operations
 */
class SubmissionService {
	private readonly baseUrl = '/groups';
	private readonly submissionsUrl = '/submissions';

	/**
	 * Get submission for specific group and milestone
	 * @param groupId - The group ID
	 * @param milestoneId - The milestone ID
	 * @returns Promise with submission details
	 */
	async getSubmissionByGroupAndMilestone(
		groupId: string,
		milestoneId: string,
	): Promise<ApiResponse<SubmissionDetail>> {
		const response = await httpClient.get<ApiResponse<SubmissionDetail>>(
			`${this.baseUrl}/${groupId}/milestones/${milestoneId}`,
		);
		return response.data;
	}

	/**
	 * Find submissions by milestone ID
	 * @param milestoneId - The milestone ID
	 * @returns Promise with array of submission items
	 */
	async findByMilestone(
		milestoneId: string,
	): Promise<ApiResponse<SubmissionItem[]>> {
		const response = await httpClient.get<ApiResponse<SubmissionItem[]>>(
			`${this.submissionsUrl}/milestone/${milestoneId}`,
		);
		return response.data;
	}

	/**
	 * Find submission by ID
	 * @param id - The submission ID
	 * @returns Promise with submission detail response
	 */
	async findById(id: string): Promise<SubmissionDetailResponse> {
		const response = await httpClient.get<SubmissionDetailResponse>(
			`${this.submissionsUrl}/${id}`,
		);
		return response.data;
	}
}

// Export a singleton instance
const submissionService = new SubmissionService();
export { submissionService };
export default submissionService;
