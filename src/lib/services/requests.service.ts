import httpClient from '@/lib/services/_httpClient';
import { ApiResponse } from '@/schemas/_common';

// Request interfaces
export interface InviteRequest {
	studentId: string;
}

export interface BulkInviteRequest {
	studentIds: string[];
}

export interface InviteResponse {
	id: string;
	groupId: string;
	studentId: string;
	status: string;
	createdAt: string;
	updatedAt: string;
}

class RequestService {
	private readonly baseUrl = '/requests';

	async inviteStudent(
		groupId: string,
		inviteData: InviteRequest,
	): Promise<ApiResponse<InviteResponse>> {
		const response = await httpClient.post<ApiResponse<InviteResponse>>(
			`${this.baseUrl}/invite/${groupId}`,
			inviteData,
		);
		return response.data;
	}

	// Bulk invite multiple students with new API
	async inviteMultipleStudents(
		groupId: string,
		studentIds: string[],
	): Promise<ApiResponse<InviteResponse[]>> {
		const response = await httpClient.post<ApiResponse<InviteResponse[]>>(
			`${this.baseUrl}/invite/${groupId}`,
			{ studentIds },
		);
		return response.data;
	}

	// Legacy method for backward compatibility
	async inviteMultipleStudentsLegacy(
		groupId: string,
		studentIds: string[],
	): Promise<InviteResponse[]> {
		const invitePromises = studentIds.map((studentId) =>
			this.inviteStudent(groupId, { studentId }),
		);

		const results = await Promise.allSettled(invitePromises);
		const successful: InviteResponse[] = [];
		const failed: string[] = [];

		results.forEach((result, index) => {
			if (result.status === 'fulfilled' && result.value.success) {
				successful.push(result.value.data);
			} else {
				failed.push(studentIds[index]);
			}
		});

		if (failed.length > 0) {
			console.warn('Failed to invite students:', failed);
		}

		return successful;
	}
}

const requestService = new RequestService();
export default requestService;
