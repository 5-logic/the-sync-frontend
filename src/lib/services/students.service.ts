import httpClient from '@/lib/services/_httpClient';
import { ApiResponse } from '@/schemas/_common';
import {
	ImportStudent,
	Student,
	StudentCreate,
	StudentToggleStatus,
	StudentUpdate,
} from '@/schemas/student';

class StudentService {
	private readonly baseUrl = '/students';

	async findAll(): Promise<ApiResponse<Student[]>> {
		const response = await httpClient.get<ApiResponse<Student[]>>(this.baseUrl);
		return response.data;
	}

	async findOne(id: string): Promise<ApiResponse<Student>> {
		const response = await httpClient.get<ApiResponse<Student>>(
			`${this.baseUrl}/${id}`,
		);
		return response.data;
	}

	async create(createStudentDto: StudentCreate): Promise<ApiResponse<Student>> {
		const response = await httpClient.post<ApiResponse<Student>>(
			this.baseUrl,
			createStudentDto,
		);
		return response.data;
	}

	async update(
		id: string,
		updateStudentDto: StudentUpdate,
	): Promise<ApiResponse<Student>> {
		const response = await httpClient.put<ApiResponse<Student>>(
			`${this.baseUrl}/${id}`,
			updateStudentDto,
		);
		return response.data;
	}

	async createMany(
		importStudentDto: ImportStudent,
	): Promise<ApiResponse<Student[]>> {
		const response = await httpClient.post<ApiResponse<Student[]>>(
			`${this.baseUrl}/import`,
			importStudentDto,
		);
		return response.data;
	}

	async findAllBySemester(semesterId: string): Promise<ApiResponse<Student[]>> {
		const response = await httpClient.get<ApiResponse<Student[]>>(
			`${this.baseUrl}/semester/${semesterId}`,
		);
		return response.data;
	}

	async toggleStatus(
		id: string,
		toggleStatusDto: StudentToggleStatus,
	): Promise<ApiResponse<Student>> {
		const response = await httpClient.post<ApiResponse<Student>>(
			`${this.baseUrl}/${id}/toggle-status`,
			toggleStatusDto,
		);
		return response.data;
	}

	async delete(id: string): Promise<ApiResponse<void>> {
		const response = await httpClient.delete<ApiResponse<void>>(
			`${this.baseUrl}/${id}`,
		);
		return response.data;
	}

	async deleteBySemester(
		id: string,
		semesterId: string,
	): Promise<ApiResponse<void>> {
		const response = await httpClient.delete<ApiResponse<void>>(
			`${this.baseUrl}/${id}/semester/${semesterId}`,
		);
		return response.data;
	}

	async updateProfile(
		updateProfileDto: StudentUpdate,
	): Promise<ApiResponse<Student>> {
		const response = await httpClient.put<ApiResponse<Student>>(
			this.baseUrl,
			updateProfileDto,
		);
		return response.data;
	}
}

export const studentService = new StudentService();
export default studentService;
