import httpClient from "@/lib/services/_httpClient";

// AI Suggestion interfaces
export interface SuggestGroupsRequest {
	studentId: string;
	semesterId: string;
}

export interface SuggestedGroupLeader {
	fullName: string;
	studentCode: string;
	email: string;
}

export interface SuggestedGroup {
	id: string;
	code: string;
	name: string;
	leader: SuggestedGroupLeader;
	memberCount: number;
	compatibility: number;
}

export interface SuggestGroupsData {
	reason: string;
	groups: SuggestedGroup[];
}

export interface SuggestGroupsResponse {
	success: boolean;
	statusCode: number;
	data: SuggestGroupsData;
}

// AI Suggest Students interfaces
export interface SuggestedStudentResponsibility {
	responsibilityId: string;
	responsibilityName: string;
	level: string;
}

export interface SuggestedStudentMajor {
	id: string;
	name: string;
	code: string;
	createdAt: string;
	updatedAt: string;
}

export interface SuggestedStudentEnrollment {
	semester: {
		id: string;
		name: string;
		code: string;
		status: string;
	};
	status: string;
}

export interface SuggestedStudent {
	id: string;
	fullName: string;
	email: string;
	gender: string;
	phoneNumber: string;
	isActive: boolean;
	studentCode: string;
	majorId: string;
	createdAt: string;
	updatedAt: string;
	major: SuggestedStudentMajor;
	enrollments: SuggestedStudentEnrollment[];
	studentResponsibilities: SuggestedStudentResponsibility[];
	compatibility: number;
}

export interface SuggestStudentsResponse {
	success: boolean;
	statusCode: number;
	data: {
		reason: string;
		students: SuggestedStudent[];
	};
}

// AI Suggest Thesis interfaces
export interface SuggestedThesisLecturer {
	id: string;
	name: string;
	email: string;
}

export interface SuggestedThesis {
	id: string;
	englishName: string;
	abbreviation: string;
	supervisorsName: string[];
	compatibility: number;
	orientation: string;
}

export interface SuggestThesesData {
	reason: string;
	theses: SuggestedThesis[];
}

export interface SuggestThesesResponse {
	success: boolean;
	statusCode: number;
	data: SuggestThesesData;
}

// Legacy interfaces for backward compatibility
export interface ThesisSuggestion {
	thesis: {
		id: string;
		englishName: string;
		vietnameseName?: string;
		description?: string;
		domain?: string;
		lecturer: SuggestedThesisLecturer;
	};
	relevanceScore: number;
	matchingFactors: string[];
}

class AIService {
	private readonly baseUrl = "/ai";

	/**
	 * Suggest groups for a student based on their responsibilities
	 */
	async suggestGroupsForStudent(
		request: SuggestGroupsRequest,
	): Promise<SuggestGroupsResponse> {
		const response = await httpClient.post<SuggestGroupsResponse>(
			`${this.baseUrl}/students/suggest-groups-for-student`,
			request,
		);
		return response.data;
	}

	/**
	 * Suggest students for a group based on group's needs and student responsibilities
	 */
	async suggestStudentsForGroup(
		groupId: string,
	): Promise<SuggestStudentsResponse> {
		const response = await httpClient.get<SuggestStudentsResponse>(
			`${this.baseUrl}/students/suggest-for-group/${groupId}`,
		);
		return response.data;
	}

	/**
	 * Suggest theses for a group based on group's project direction and responsibilities
	 */
	async suggestThesesForGroup(groupId: string): Promise<SuggestThesesResponse> {
		const response = await httpClient.get<SuggestThesesResponse>(
			`${this.baseUrl}/thesis/suggest-for-group/${groupId}`,
		);
		return response.data;
	}
}

const aiService = new AIService();
export default aiService;
