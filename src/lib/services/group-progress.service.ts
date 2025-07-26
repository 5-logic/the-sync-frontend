/**
 * Group Progress Service - Pure API calls
 * Follows Separation of Concerns: Only handles API communication
 */
import { SupervisedGroup } from '@/lib/services/groups.service';
import { GroupDashboard } from '@/schemas/group';
import { Milestone } from '@/schemas/milestone';

interface SubmissionDetail {
	id: string;
	status: string;
	createdAt: string;
	documents: string[];
	group: {
		code: string;
	};
	assignmentReviews?: Array<{
		reviewerId: string;
	}>;
}

class GroupProgressService {
	private baseUrl = '/api';

	/**
	 * Fetch supervised groups by semester
	 */
	async getGroupsBySemester(
		semesterId: string,
	): Promise<{ data: SupervisedGroup[] }> {
		const response = await fetch(
			`${this.baseUrl}/groups/supervised/${semesterId}`,
		);
		return response.json();
	}

	/**
	 * Fetch detailed group information
	 */
	async getGroupDetail(groupId: string): Promise<{ data: GroupDashboard }> {
		const response = await fetch(`${this.baseUrl}/groups/${groupId}`);
		return response.json();
	}

	/**
	 * Fetch milestones by semester
	 */
	async getMilestonesBySemester(
		semesterId: string,
	): Promise<{ data: Milestone[] }> {
		const response = await fetch(
			`${this.baseUrl}/milestones/semester/${semesterId}`,
		);
		return response.json();
	}

	/**
	 * Fetch group submission for specific milestone
	 */
	async getGroupSubmission(
		groupId: string,
		milestoneId: string,
	): Promise<{ data: SubmissionDetail }> {
		const response = await fetch(
			`${this.baseUrl}/submissions/${groupId}/${milestoneId}`,
		);
		return response.json();
	}
}

export const groupProgressService = new GroupProgressService();
