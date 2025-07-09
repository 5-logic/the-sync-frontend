import httpClient from '@/lib/services/_httpClient';
import { ApiResponse } from '@/schemas/_common';

// Request interfaces
export interface InviteRequest {
	studentId: string;
}

export interface BulkInviteRequest {
	studentIds: string[];
}

export interface JoinRequest {
	groupId: string;
}

export interface InviteResponse {
	id: string;
	groupId: string;
	studentId: string;
	status: string;
	createdAt: string;
	updatedAt: string;
}

export interface GroupRequest {
	id: string;
	type: 'Invite' | 'Join';
	status: 'Pending' | 'Approved' | 'Rejected';
	studentId: string;
	groupId: string;
	createdAt: string;
	updatedAt: string;
	student: {
		userId: string;
		studentCode: string;
		majorId: string;
		user: {
			id: string;
			fullName: string;
			email: string;
		};
	};
	group: {
		id: string;
		code: string;
		name: string;
	};
}

export interface UpdateRequestStatusRequest {
	status: 'Approved' | 'Rejected';
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

	// Get all requests for a group (only accessible by group leader)
	async getGroupRequests(
		groupId: string,
	): Promise<ApiResponse<GroupRequest[]>> {
		const response = await httpClient.get<ApiResponse<GroupRequest[]>>(
			`${this.baseUrl}/group/${groupId}`,
		);
		return response.data;
	}

	// Get all requests for current student (student without group)
	async getStudentRequests(): Promise<ApiResponse<GroupRequest[]>> {
		const response = await httpClient.get<ApiResponse<GroupRequest[]>>(
			`${this.baseUrl}/student`,
		);
		return response.data;
	}

	// Update request status (approve/reject)
	async updateRequestStatus(
		requestId: string,
		statusData: UpdateRequestStatusRequest,
	): Promise<ApiResponse<GroupRequest>> {
		const response = await httpClient.put<ApiResponse<GroupRequest>>(
			`${this.baseUrl}/${requestId}/status`,
			statusData,
		);
		return response.data;
	}

	// Cancel student's own request
	async cancelStudentRequest(requestId: string): Promise<ApiResponse<void>> {
		const response = await httpClient.delete<ApiResponse<void>>(
			`${this.baseUrl}/${requestId}`,
		);
		return response.data;
	}

	// Student request to join a group
	async joinGroup(groupId: string): Promise<ApiResponse<GroupRequest>> {
		const response = await httpClient.post<ApiResponse<GroupRequest>>(
			`${this.baseUrl}/join`,
			{ groupId },
		);
		return response.data;
	}
}

const requestService = new RequestService();
export default requestService;
