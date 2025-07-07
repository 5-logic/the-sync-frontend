import httpClient from '@/lib/services/_httpClient';

export interface Responsibility {
	id: string;
	name: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface ResponsibilityApiResponse {
	success: boolean;
	statusCode: number;
	data: Responsibility[];
}

export class ResponsibilityService {
	private static readonly baseUrl = '/responsibilities';

	/**
	 * Fetch all responsibilities
	 */
	static async getAll(): Promise<Responsibility[]> {
		try {
			const response = await httpClient.get(this.baseUrl);

			// Get the actual API response (axios wraps it in response.data)
			const apiResponse: ResponsibilityApiResponse = response.data;

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

			// Transform string dates to Date objects
			return responsibilitiesData.map((responsibility) => ({
				...responsibility,
				createdAt: new Date(responsibility.createdAt),
				updatedAt: new Date(responsibility.updatedAt),
			}));
		} catch (error) {
			if (error instanceof Error) {
				throw error;
			}
			throw new Error('Failed to fetch responsibilities');
		}
	}
}
