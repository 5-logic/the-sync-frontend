import httpClient from '@/lib/services/_httpClient';
import { ApiResponse } from '@/schemas/_common';
import { type Responsibility } from '@/schemas/responsibility';

class ResponsibilitiesService {
	private readonly baseUrl = '/responsibilities';

	/**
	 * Fetch all responsibilities
	 */
	async getAll(): Promise<ApiResponse<Responsibility[]>> {
		const response = await httpClient.get<ApiResponse<Responsibility[]>>(
			this.baseUrl,
		);
		return response.data;
	}
}

const responsibilitiesService = new ResponsibilitiesService();
export default responsibilitiesService;
