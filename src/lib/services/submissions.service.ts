import httpClient from '@/lib/services/_httpClient';
import { ApiResponse } from '@/schemas/_common';
import { SubmissionDetail } from '@/schemas/submission';

/**
 * Submission Service
 * Handles submission-related API operations
 */
class SubmissionService {
	private readonly baseUrl = '/groups';

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
}

// Export a singleton instance
const submissionService = new SubmissionService();
export default submissionService;
