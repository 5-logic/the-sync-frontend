import httpClient from '@/lib/services/_httpClient';
import { ApiResponse } from '@/schemas/_common';
import { Semester, SemesterCreate, SemesterUpdate } from '@/schemas/semester';

// Types for enrollment update
export interface UpdateEnrollmentsRequest {
	studentIds: string[];
	status: 'Passed' | 'Failed';
}

export interface UpdateEnrollmentsResponse {
	updatedCount: number;
	message: string;
}

class SemesterService {
	private readonly baseUrl = '/semesters';

	async findAll(): Promise<ApiResponse<Semester[]>> {
		const response = await httpClient.get<ApiResponse<Semester[]>>(
			this.baseUrl,
		);
		return response.data;
	}

	async findOne(id: string): Promise<ApiResponse<Semester>> {
		const response = await httpClient.get<ApiResponse<Semester>>(
			`${this.baseUrl}/${id}`,
		);
		return response.data;
	}

	async create(
		createSemesterDto: SemesterCreate,
	): Promise<ApiResponse<Semester>> {
		const response = await httpClient.post<ApiResponse<Semester>>(
			this.baseUrl,
			createSemesterDto,
		);
		return response.data;
	}

	async update(
		id: string,
		updateSemesterDto: SemesterUpdate,
	): Promise<ApiResponse<Semester>> {
		const response = await httpClient.put<ApiResponse<Semester>>(
			`${this.baseUrl}/${id}`,
			updateSemesterDto,
		);
		return response.data;
	}

	async delete(id: string): Promise<ApiResponse<void>> {
		const response = await httpClient.delete<ApiResponse<void>>(
			`${this.baseUrl}/${id}`,
		);
		return response.data;
	}

	async updateEnrollments(
		id: string,
		updateData: UpdateEnrollmentsRequest,
	): Promise<ApiResponse<UpdateEnrollmentsResponse>> {
		const response = await httpClient.put<
			ApiResponse<UpdateEnrollmentsResponse>
		>(`${this.baseUrl}/${id}/enrollments`, updateData);
		return response.data;
	}
}

export const semesterService = new SemesterService();
export default semesterService;
