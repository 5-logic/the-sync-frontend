import httpClient from '@/lib/services/_httpClient';
import { ApiResponse } from '@/schemas/_common';
import { Student, StudentCreate, StudentUpdate } from '@/schemas/student';

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
		createStudentDtos: StudentCreate[],
	): Promise<ApiResponse<Student[]>> {
		const response = await httpClient.post<ApiResponse<Student[]>>(
			`${this.baseUrl}/import`,
			createStudentDtos,
		);
		return response.data;
	}
}

export const studentService = new StudentService();
export default studentService;
