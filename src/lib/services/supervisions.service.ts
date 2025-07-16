import httpClient from '@/lib/services/_httpClient';
import { ApiResponse } from '@/schemas/_common';

export interface SupervisionData {
	lecturerId: string;
}

class SupervisionsService {
	private readonly baseUrl = '/supervisions';

	/**
	 * Get supervisions for a specific thesis
	 */
	async getByThesisId(
		thesisId: string,
	): Promise<ApiResponse<SupervisionData[]>> {
		const response = await httpClient.get<ApiResponse<SupervisionData[]>>(
			`${this.baseUrl}/thesis/${thesisId}`,
		);
		return response.data;
	}
}

const supervisionsService = new SupervisionsService();
export default supervisionsService;
