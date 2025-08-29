import httpClient from '@/lib/services/_httpClient';

export interface AIStatistic {
	type: 'CheckDuplicateThesis' | 'SuggestThesis' | 'SuggestParticipants';
	count: number;
}

export interface AIStatisticsData {
	semesterId: string;
	totalCalls: number;
	statistics: AIStatistic[];
}

export interface AIStatisticsResponse {
	success: boolean;
	statusCode: number;
	data: AIStatisticsData;
}

export class AIStatisticsService {
	/**
	 * Get AI usage statistics for a specific semester
	 */
	static async getSemesterAIStatistics(
		semesterId: string,
	): Promise<AIStatisticsData> {
		const response = await httpClient.get<AIStatisticsResponse>(
			`/semesters/${semesterId}/statistics-ai`,
		);
		return response.data.data;
	}
}
