import httpClient from '@/lib/services/_httpClient';

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

class AIService {
	private readonly baseUrl = '/ai';

	/**
	 * Suggest groups for a student based on their skills and responsibilities
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
}

const aiService = new AIService();
export default aiService;
