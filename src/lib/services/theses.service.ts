import httpClient from '@/lib/services/_httpClient';
import { ApiResponse } from '@/schemas/_common';
import { Thesis, ThesisCreate, ThesisUpdate } from '@/schemas/thesis';

// Review thesis interface
interface ReviewThesisDto {
	status: 'Approved' | 'Rejected';
}

class ThesisService {
	private readonly baseUrl = '/theses';

	async findAll(): Promise<ApiResponse<Thesis[]>> {
		const response = await httpClient.get<ApiResponse<Thesis[]>>(this.baseUrl);
		return response.data;
	}

	async findOne(id: string): Promise<ApiResponse<Thesis>> {
		const response = await httpClient.get<ApiResponse<Thesis>>(
			`${this.baseUrl}/${id}`,
		);
		return response.data;
	}

	async findByLecturerId(lecturerId: string): Promise<ApiResponse<Thesis[]>> {
		const response = await httpClient.get<ApiResponse<Thesis[]>>(
			`${this.baseUrl}/lecturer/${lecturerId}`,
		);
		return response.data;
	}

	async create(createThesisDto: ThesisCreate): Promise<ApiResponse<Thesis>> {
		const response = await httpClient.post<ApiResponse<Thesis>>(
			this.baseUrl,
			createThesisDto,
		);
		return response.data;
	}

	async update(
		id: string,
		updateThesisDto: ThesisUpdate,
	): Promise<ApiResponse<Thesis>> {
		const response = await httpClient.put<ApiResponse<Thesis>>(
			`${this.baseUrl}/${id}`,
			updateThesisDto,
		);
		return response.data;
	}

	async delete(id: string): Promise<ApiResponse<void>> {
		const response = await httpClient.delete<ApiResponse<void>>(
			`${this.baseUrl}/${id}`,
		);
		return response.data;
	}

	async togglePublishStatus(id: string): Promise<ApiResponse<Thesis>> {
		const response = await httpClient.patch<ApiResponse<Thesis>>(
			`${this.baseUrl}/${id}/toggle-publish`,
		);
		return response.data;
	}

	async submitThesis(id: string): Promise<ApiResponse<Thesis>> {
		const response = await httpClient.post<ApiResponse<Thesis>>(
			`${this.baseUrl}/${id}/submit`,
		);
		return response.data;
	}

	async reviewThesis(
		id: string,
		reviewData: ReviewThesisDto,
	): Promise<ApiResponse<Thesis>> {
		const response = await httpClient.post<ApiResponse<Thesis>>(
			`${this.baseUrl}/${id}/review`,
			reviewData,
		);
		return response.data;
	}
}

export const thesisService = new ThesisService();
export default thesisService;
