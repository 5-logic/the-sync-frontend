import httpClient from "@/lib/services/_httpClient";

// AI Suggestion interfaces
export interface SuggestGroupsRequest {
	studentId: string;
	semesterId: string;
}

export interface SuggestedGroupMember {
	id: string;
	name: string;
	isLeader: boolean;
}

export interface SuggestedGroup {
	id: string;
	code: string;
	name: string;
	projectDirection: string;
	thesis: null;
	currentMembersCount: number;
	leader: {
		id: string;
		name: string;
	};
	members: SuggestedGroupMember[];
}

export interface GroupSuggestion {
	group: SuggestedGroup;
	compatibilityScore: number;
	matchingSkills: number;
	matchingResponsibilities: number;
}

export interface SuggestGroupsData {
	student: {
		id: string;
		studentCode: string;
		name: string;
		email: string;
	};
	suggestions: GroupSuggestion[];
	totalGroups: number;
}

export interface SuggestGroupsResponse {
	success: boolean;
	statusCode: number;
	data: SuggestGroupsData;
}

// AI Suggest Students interfaces
export interface SuggestedStudentResponsibility {
	id: string;
	name: string;
}

export interface SuggestedStudent {
	id: string;
	studentCode: string;
	fullName: string;
	email: string;
	responsibilities: SuggestedStudentResponsibility[];
	similarityScore: number;
	matchPercentage: number;
}

export interface SuggestStudentsResponse {
	success: boolean;
	statusCode: number;
	data: SuggestedStudent[];
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
	vietnameseName: string;
	description: string;
	domain?: string; // Add optional domain field
	lecturer: SuggestedThesisLecturer;
}

export interface ThesisSuggestion {
	thesis: SuggestedThesis;
	relevanceScore: number;
	matchingFactors: string[];
}

export interface SuggestedGroup {
	id: string;
	code: string;
	name: string;
	projectDirection: string;
	membersCount: number;
}

export interface SuggestThesesData {
	group: SuggestedGroup;
	suggestions: ThesisSuggestion[];
	totalAvailableTheses: number;
}

export interface SuggestThesesResponse {
	success: boolean;
	statusCode: number;
	data: SuggestThesesData;
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
	 * Suggest theses for a group based on group's project direction and skills
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
