import httpClient from '@/lib/services/_httpClient';
import { ApiResponse } from '@/schemas/_common';
import { type Responsibility } from '@/schemas/responsibility';

export class ResponsibilityService {
	private static readonly baseUrl = '/responsibilities';

	/**
	 * Fetch all responsibilities
	 */
	static async getAll(): Promise<Responsibility[]> {
		try {
			const response = await httpClient.get<ApiResponse<Responsibility[]>>(
				this.baseUrl,
			);

			// Get the actual API response (axios wraps it in response.data)
			const apiResponse = response.data;

			if (!apiResponse.success) {
				throw new Error('Failed to fetch responsibilities');
			}

			const responsibilitiesData = apiResponse.data;

			// Validate the responsibilities array
			if (!Array.isArray(responsibilitiesData)) {
				throw new Error(
					'Invalid response format: expected array of responsibilities',
				);
			}

			// Return the data directly since schema transformation handles date parsing
			return responsibilitiesData;
		} catch (error) {
			if (error instanceof Error) {
				throw error;
			}
			throw new Error('Failed to fetch responsibilities');
		}
	}
}
