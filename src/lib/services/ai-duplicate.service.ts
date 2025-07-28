import httpClient from '@/lib/services/_httpClient';
import { ApiResponse } from '@/schemas/_common';

export interface DuplicateThesis {
	id: string;
	englishName: string;
	vietnameseName: string;
	description: string;
	duplicatePercentage: number;
}

export interface DuplicateCheckResponse {
	success: boolean;
	statusCode: number;
	data: DuplicateThesis[];
}

class AiDuplicateService {
	private readonly baseUrl = '/ai/thesis';

	async checkDuplicate(
		thesisId: string,
	): Promise<ApiResponse<DuplicateThesis[]>> {
		const response = await httpClient.get<ApiResponse<DuplicateThesis[]>>(
			`${this.baseUrl}/check-duplicate/${thesisId}`,
		);
		return response.data;
	}
}

export const aiDuplicateService = new AiDuplicateService();
export default aiDuplicateService;
