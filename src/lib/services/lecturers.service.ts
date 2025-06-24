import httpClient from '@/lib/services/_httpClient';
import { ApiResponse } from '@/schemas/_common';
import {
	Lecturer,
	LecturerCreate,
	LecturerToggleStatus,
	LecturerUpdate,
} from '@/schemas/lecturer';

class LecturerService {
	private readonly baseUrl = '/lecturers';

	async findAll(): Promise<ApiResponse<Lecturer[]>> {
		const response = await httpClient.get<ApiResponse<Lecturer[]>>(
			this.baseUrl,
		);
		return response.data;
	}

	async findOne(id: string): Promise<ApiResponse<Lecturer>> {
		const response = await httpClient.get<ApiResponse<Lecturer>>(
			`${this.baseUrl}/${id}`,
		);
		return response.data;
	}

	async create(
		createLecturerDto: LecturerCreate,
	): Promise<ApiResponse<Lecturer>> {
		const response = await httpClient.post<ApiResponse<Lecturer>>(
			this.baseUrl,
			createLecturerDto,
		);
		return response.data;
	}

	async update(
		id: string,
		updateLecturerDto: LecturerUpdate,
	): Promise<ApiResponse<Lecturer>> {
		const response = await httpClient.put<ApiResponse<Lecturer>>(
			`${this.baseUrl}/${id}`,
			updateLecturerDto,
		);
		return response.data;
	}

	async createMany(
		createLecturerDtos: LecturerCreate[],
	): Promise<ApiResponse<Lecturer[]>> {
		const response = await httpClient.post<ApiResponse<Lecturer[]>>(
			`${this.baseUrl}/import`,
			createLecturerDtos,
		);
		return response.data;
	}

	async toggleStatus(
		id: string,
		toggleStatusDto: LecturerToggleStatus,
	): Promise<ApiResponse<Lecturer>> {
		const response = await httpClient.post<ApiResponse<Lecturer>>(
			`${this.baseUrl}/${id}/toggle-status`,
			toggleStatusDto,
		);
		return response.data;
	}
}

export const lecturerService = new LecturerService();
export default lecturerService;
