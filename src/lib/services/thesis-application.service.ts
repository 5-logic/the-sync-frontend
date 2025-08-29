import httpClient from '@/lib/services/_httpClient';
import { ApiResponse } from '@/schemas/_common';
import { ThesisOrientation } from '@/schemas/_enums';

// Thesis application interface
export interface ThesisApplication {
	groupId: string;
	thesisId: string;
	status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
	createdAt: string;
	updatedAt: string;
	thesis: {
		id: string;
		englishName: string;
		vietnameseName: string;
		abbreviation: string;
		description: string;
		domain: string;
		orientation?: ThesisOrientation | null;
		status: string;
		isPublish: boolean;
		groupId: string | null;
		lecturerId: string;
		semesterId: string;
		createdAt: string;
		updatedAt: string;
		lecturer: {
			userId: string;
			isModerator: boolean;
			user: {
				id: string;
				fullName: string;
				email: string;
				gender: string;
				phoneNumber: string;
				isActive: boolean;
				createdAt: string;
				updatedAt: string;
			};
		};
	};
	group: {
		id: string;
		code: string;
		name: string;
		projectDirection: string;
		semesterId: string;
		thesisId: string | null;
		createdAt: string;
		updatedAt: string;
		studentGroupParticipations: Array<{
			studentId: string;
			groupId: string;
			semesterId: string;
			isLeader: boolean;
			student: {
				userId: string;
				studentCode: string;
				majorId: string;
				user: {
					id: string;
					fullName: string;
					email: string;
					gender: string;
					phoneNumber: string;
					isActive: boolean;
					createdAt: string;
					updatedAt: string;
				};
			};
		}>;
	};
}

class ThesisApplicationService {
	private readonly baseUrl = '/thesis-application';

	// Apply for thesis
	async applyForThesis(
		semesterId: string,
		groupId: string,
		thesisId: string,
	): Promise<ApiResponse<void>> {
		const response = await httpClient.post<ApiResponse<void>>(
			`${this.baseUrl}/${semesterId}`,
			{ groupId, thesisId },
		);
		return response.data;
	}

	// Get thesis applications for a group
	async getThesisApplications(
		semesterId: string,
		groupId: string,
	): Promise<ApiResponse<ThesisApplication[]>> {
		const response = await httpClient.get<ApiResponse<ThesisApplication[]>>(
			`${this.baseUrl}/${semesterId}/${groupId}`,
		);
		return response.data;
	}

	// Cancel thesis application
	async cancelThesisApplication(
		groupId: string,
		thesisId: string,
	): Promise<ApiResponse<void>> {
		const response = await httpClient.put<ApiResponse<void>>(
			`${this.baseUrl}/${groupId}/${thesisId}/cancel`,
		);
		return response.data;
	}

	// Get all thesis applications for lecturer (by semester)
	async getThesisApplicationsBySemester(
		semesterId: string,
	): Promise<ApiResponse<ThesisApplication[]>> {
		const response = await httpClient.get<ApiResponse<ThesisApplication[]>>(
			`${this.baseUrl}/${semesterId}`,
		);
		return response.data;
	}

	// Update thesis application status (approve/reject)
	async updateThesisApplicationStatus(
		groupId: string,
		thesisId: string,
		status: 'Approved' | 'Rejected',
	): Promise<ApiResponse<void>> {
		const response = await httpClient.put<ApiResponse<void>>(
			`${this.baseUrl}/${groupId}/${thesisId}`,
			{ status },
		);
		return response.data;
	}
}

export const thesisApplicationService = new ThesisApplicationService();
export default thesisApplicationService;
