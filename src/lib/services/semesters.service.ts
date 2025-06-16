import httpClient from '@/lib/services/_httpClient';
import { ApiResponse } from '@/schemas/_common';
import { Semester, SemesterCreate, SemesterUpdate } from '@/schemas/semester';

class SemesterService {
	private baseUrl = '/semesters';

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
}

export const semesterService = new SemesterService();
export default semesterService;
