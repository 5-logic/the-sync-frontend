import httpClient from '@/lib/services/_httpClient';
import { ApiResponse } from '@/schemas/_common';
import {
	Milestone,
	MilestoneCreate,
	MilestoneUpdate,
} from '@/schemas/milestone';

/**
 * Milestone Service
 * Handles all milestone-related API operations
 */
class MilestoneService {
	private readonly baseUrl = '/milestones';
	/**
	 * Get all milestones
	 */
	async findAll(): Promise<ApiResponse<Milestone[]>> {
		const response = await httpClient.get<ApiResponse<Milestone[]>>(
			this.baseUrl,
		);
		return response.data;
	}

	/**
	 * Get milestone by ID
	 */
	async findById(id: string): Promise<ApiResponse<Milestone>> {
		const response = await httpClient.get<ApiResponse<Milestone>>(
			`${this.baseUrl}/${id}`,
		);
		return response.data;
	}

	/**
	 * Create new milestone
	 */
	async create(data: MilestoneCreate): Promise<ApiResponse<Milestone>> {
		const response = await httpClient.post<ApiResponse<Milestone>>(
			this.baseUrl,
			data,
		);
		return response.data;
	}

	/**
	 * Update milestone
	 */
	async update(
		id: string,
		data: MilestoneUpdate,
	): Promise<ApiResponse<Milestone>> {
		const response = await httpClient.put<ApiResponse<Milestone>>(
			`${this.baseUrl}/${id}`,
			data,
		);
		return response.data;
	}

	/**
	 * Delete milestone
	 */
	async delete(id: string): Promise<ApiResponse<void>> {
		const response = await httpClient.delete<ApiResponse<void>>(
			`${this.baseUrl}/${id}`,
		);
		return response.data;
	}

	/**
	 * Get current active milestone
	 */
	async getCurrentMilestone(): Promise<ApiResponse<Milestone | null>> {
		const response = await httpClient.get<ApiResponse<Milestone | null>>(
			`${this.baseUrl}/current`,
		);
		return response.data;
	}

	/**
	 * Get milestones by semester ID
	 */
	async findBySemesterId(
		semesterId: string,
	): Promise<ApiResponse<Milestone[]>> {
		const response = await httpClient.get<ApiResponse<Milestone[]>>(
			`${this.baseUrl}/semester/${semesterId}`,
		);
		return response.data;
	}
}

// Export a singleton instance
const milestoneService = new MilestoneService();
export default milestoneService;
