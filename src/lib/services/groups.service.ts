import httpClient from '@/lib/services/_httpClient';
import { ApiResponse } from '@/schemas/_common';
import { GroupDashboard } from '@/schemas/group';

// Group interfaces
export interface GroupCreate {
	name: string;
	projectDirection?: string;
	skillIds?: string[];
	responsibilityIds?: string[];
}

export interface Group {
	id: string;
	code: string;
	name: string;
	projectDirection?: string;
	createdAt: string;
	updatedAt: string;
	semester: {
		id: string;
		name: string;
		code: string;
		status: string;
	};
	memberCount: number;
	skillCount: number;
	responsibilityCount: number;
	leader: {
		student: {
			userId: string;
			studentCode: string;
			user: {
				id: string;
				fullName: string;
			};
		};
	};
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

	async findOne(id: string): Promise<ApiResponse<GroupDashboard>> {
		const response = await httpClient.get<ApiResponse<GroupDashboard>>(
			`${this.baseUrl}/${id}`,
		);
		return response.data;
	}

	async getStudentGroup(): Promise<ApiResponse<GroupDashboard[]>> {
		const response = await httpClient.get<ApiResponse<GroupDashboard[]>>(
			`${this.baseUrl}/student`,
		);
		return response.data;
	}

	async getStudentGroupById(
		studentId: string,
	): Promise<ApiResponse<GroupDashboard[]>> {
		const response = await httpClient.get<ApiResponse<GroupDashboard[]>>(
			`${this.baseUrl}/student/${studentId}`,
		);
		return response.data;
	}

	async getPublicGroupDetail(
		groupId: string,
	): Promise<ApiResponse<GroupDashboard>> {
		const response = await httpClient.get<ApiResponse<GroupDashboard>>(
			`${this.baseUrl}/${groupId}`,
		);
		return response.data;
	}

	async leaveGroup(groupId: string): Promise<ApiResponse<void>> {
		const response = await httpClient.put<ApiResponse<void>>(
			`${this.baseUrl}/${groupId}/leave`,
		);
		return response.data;
	}

	async deleteGroup(groupId: string): Promise<ApiResponse<void>> {
		const response = await httpClient.delete<ApiResponse<void>>(
			`${this.baseUrl}/${groupId}`,
		);
		return response.data;
	}

	async removeMember(
		groupId: string,
		studentId: string,
	): Promise<ApiResponse<void>> {
		const response = await httpClient.put<ApiResponse<void>>(
			`${this.baseUrl}/${groupId}/remove-student`,
			{ studentId },
		);
		return response.data;
	}

	async changeLeader(
		groupId: string,
		newLeaderId: string,
	): Promise<ApiResponse<void>> {
		const response = await httpClient.put<ApiResponse<void>>(
			`${this.baseUrl}/${groupId}/change-leader`,
			{ newLeaderId },
		);
		return response.data;
	}

	async assignStudent(
		groupId: string,
		studentId: string,
	): Promise<ApiResponse<void>> {
		const response = await httpClient.put<ApiResponse<void>>(
			`${this.baseUrl}/${groupId}/assign-student`,
			{ studentId },
		);
		return response.data;
	}

	async pickThesis(
		groupId: string,
		thesisId: string,
	): Promise<ApiResponse<void>> {
		const response = await httpClient.put<ApiResponse<void>>(
			`${this.baseUrl}/${groupId}/pick-thesis`,
			{ thesisId },
		);
		return response.data;
	}

	async unpickThesis(groupId: string): Promise<ApiResponse<void>> {
		const response = await httpClient.put<ApiResponse<void>>(
			`${this.baseUrl}/${groupId}/unpick-thesis`,
		);
		return response.data;
	}
}

const groupService = new GroupService();
export default groupService;
