import httpClient from '@/lib/services/_httpClient';
import { ApiResponse } from '@/schemas/_common';

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

class SubmissionService {
	private readonly baseUrl = '/submissions';

	async findByMilestone(
		milestoneId: string,
	): Promise<ApiResponse<SubmissionItem[]>> {
		const response = await httpClient.get<ApiResponse<SubmissionItem[]>>(
			`/submissions/milestone/${milestoneId}`,
		);
		return response.data;
	}
}

export const submissionService = new SubmissionService();
export default submissionService;
