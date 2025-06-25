import httpClient from '@/lib/services/_httpClient';
import { ApiResponse } from '@/schemas/_common';
import { Major } from '@/schemas/major';

class MajorService {
	private readonly baseUrl = '/majors';

	async findAll(): Promise<ApiResponse<Major[]>> {
		const response = await httpClient.get<ApiResponse<Major[]>>(this.baseUrl);
		return response.data;
	}

	async findOne(id: string): Promise<ApiResponse<Major>> {
		const response = await httpClient.get<ApiResponse<Major>>(
			`${this.baseUrl}/${id}`,
		);
		return response.data;
	}
}

export const majorService = new MajorService();
export default majorService;
