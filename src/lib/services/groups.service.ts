import httpClient from '@/lib/services/_httpClient';
import { ApiResponse } from '@/schemas/_common';

// Group interfaces
export interface GroupCreate {
	name: string;
	projectDirection?: string;
	skillIds?: string[];
	responsibilityIds?: string[];
}

export interface Group {
	id: string;
	name: string;
	projectDirection?: string;
	skillIds?: string[];
	responsibilityIds?: string[];
	createdAt: string;
	updatedAt: string;
}

class GroupService {
	private readonly baseUrl = '/groups';

	async create(createGroupDto: GroupCreate): Promise<ApiResponse<Group>> {
		const response = await httpClient.post<ApiResponse<Group>>(
			this.baseUrl,
			createGroupDto,
		);
		return response.data;
	}

	async findAll(): Promise<ApiResponse<Group[]>> {
		const response = await httpClient.get<ApiResponse<Group[]>>(this.baseUrl);
		return response.data;
	}

	async findOne(id: string): Promise<ApiResponse<Group>> {
		const response = await httpClient.get<ApiResponse<Group>>(
			`${this.baseUrl}/${id}`,
		);
		return response.data;
	}
}

const groupService = new GroupService();
export default groupService;
