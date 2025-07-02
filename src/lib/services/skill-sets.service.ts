import httpClient from '@/lib/services/_httpClient';
import { type SkillSet, SkillSetApiResponseSchema } from '@/schemas/skill';

export class SkillSetsService {
	private static baseUrl = '/skill-sets';

	/**
	 * Fetch all skill sets with their skills
	 */
	static async getAll(): Promise<SkillSet[]> {
		try {
			const response = await httpClient.get(this.baseUrl);

			// Debug: Log actual response
			console.log('API Response:', response);
			console.log('Response data:', response.data);

			// Get the actual API response (axios wraps it in response.data)
			const apiResponse = response.data;

			// Parse and validate the API response
			const parsed = SkillSetApiResponseSchema.parse(apiResponse);

			if (!parsed.success) {
				throw new Error('Failed to fetch skill sets');
			}

			const skillSetsData = parsed.data;

			// Validate the skill sets array
			if (!Array.isArray(skillSetsData)) {
				throw new Error(
					'Invalid response format: expected array of skill sets',
				);
			}

			// Return parsed data (Zod already transformed dates)
			return skillSetsData;
		} catch (error) {
			console.error('Error fetching skill sets:', error);
			if (error instanceof Error) {
				throw error;
			}
			throw new Error('Failed to fetch skill sets');
		}
	}
}
