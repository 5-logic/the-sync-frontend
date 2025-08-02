import httpClient from "@/lib/services/_httpClient";
import { ApiResponse } from "@/schemas/_common";
import { ChecklistItem, ChecklistItemCreate } from "@/schemas/checklist";

class ChecklistItemService {
	private readonly baseUrl = "/ChecklistItems";

	async create(
		createChecklistItemDto: ChecklistItemCreate,
	): Promise<ApiResponse<ChecklistItem>> {
		const response = await httpClient.post<ApiResponse<ChecklistItem>>(
			this.baseUrl,
			createChecklistItemDto,
		);
		return response.data;
	}

	async delete(id: string): Promise<ApiResponse<void>> {
		const response = await httpClient.delete<ApiResponse<void>>(
			`${this.baseUrl}/${id}`,
		);
		return response.data;
	}

	async updateList(
		checklistId: string,
		items: {
			id: string;
			name: string;
			description: string;
			isRequired: boolean;
		}[],
	): Promise<ApiResponse<ChecklistItem[]>> {
		const response = await httpClient.put<ApiResponse<ChecklistItem[]>>(
			`${this.baseUrl}/checklist/${checklistId}/update-list`,
			{ items },
		);
		return response.data;
	}

	async createList(
		checklistId: string,
		items: {
			name: string;
			description: string;
			isRequired: boolean;
		}[],
	): Promise<ApiResponse<ChecklistItem[]>> {
		const response = await httpClient.post<ApiResponse<ChecklistItem[]>>(
			`${this.baseUrl}/create-list`,
			{
				checklistId,
				checklistItems: items,
			},
		);
		return response.data;
	}
}

export const checklistItemService = new ChecklistItemService();
export default checklistItemService;
