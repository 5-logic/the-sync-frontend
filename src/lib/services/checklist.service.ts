import httpClient from '@/lib/services/_httpClient';
import { ApiResponse } from '@/schemas/_common';
import {
	Checklist,
	ChecklistCreate,
	ChecklistUpdate,
} from '@/schemas/checklist';

class ChecklistService {
	private readonly baseUrl = '/checklists';

	async findAll(): Promise<ApiResponse<Checklist[]>> {
		const response = await httpClient.get<ApiResponse<Checklist[]>>(
			this.baseUrl,
		);
		return response.data;
	}

	async findOne(id: string): Promise<ApiResponse<Checklist>> {
		const response = await httpClient.get<ApiResponse<Checklist>>(
			`${this.baseUrl}/${id}`,
		);
		return response.data;
	}

	async create(
		createChecklistDto: ChecklistCreate,
	): Promise<ApiResponse<Checklist>> {
		const response = await httpClient.post<ApiResponse<Checklist>>(
			this.baseUrl,
			createChecklistDto,
		);
		return response.data;
	}

	async update(
		id: string,
		updateChecklistDto: ChecklistUpdate,
	): Promise<ApiResponse<Checklist>> {
		const response = await httpClient.put<ApiResponse<Checklist>>(
			`${this.baseUrl}/${id}`,
			updateChecklistDto,
		);
		return response.data;
	}

	async delete(id: string): Promise<ApiResponse<void>> {
		const response = await httpClient.delete<ApiResponse<void>>(
			`${this.baseUrl}/${id}`,
		);
		return response.data;
	}
}

export const checklistService = new ChecklistService();
export default checklistService;
