import httpClient from '@/lib/services/_httpClient';
import { ApiResponse } from '@/schemas/_common';
import { type Responsibility } from '@/schemas/responsibility';

export class ResponsibilitiesService {
	private static readonly baseUrl = '/responsibilities';

	/**
	 * Fetch all responsibilities
	 */
	static async getAll(): Promise<ApiResponse<Responsibility[]>> {
		const response = await httpClient.get<ApiResponse<Responsibility[]>>(
			this.baseUrl,
		);
		return response.data;
	}
}

export default ResponsibilitiesService;
