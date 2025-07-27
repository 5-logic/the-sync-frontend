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

// Types for groups by semester API response
export interface GroupWithDetails {
	id: string;
	code: string;
	name: string;
	projectDirection: string;
	semesterId: string;
	thesisId: string;
	createdAt: string;
	updatedAt: string;
	studentGroupParticipations: StudentGroupParticipation[];
	thesis: Thesis;
}

export interface StudentGroupParticipation {
	studentId: string;
	groupId: string;
	semesterId: string;
	isLeader: boolean;
	student: Student;
}

export interface Student {
	userId: string;
	studentCode: string;
	majorId: string;
	major: Major;
	user: User;
	enrollments: Enrollment[];
}

export interface Major {
	id: string;
	name: string;
	code: string;
	createdAt: string;
	updatedAt: string;
}

export interface User {
	id: string;
	fullName: string;
	email: string;
	password: string;
	gender: string;
	phoneNumber: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface Enrollment {
	studentId: string;
	semesterId: string;
	status: string;
}

export interface Thesis {
	id: string;
	englishName: string;
	vietnameseName: string;
	abbreviation: string;
	description: string;
	domain: string;
	status: string;
	isPublish: boolean;
	groupId: string;
	lecturerId: string;
	semesterId: string;
	createdAt: string;
	updatedAt: string;
	supervisions: Supervision[];
}

export interface Supervision {
	lecturerId: string;
	thesisId: string;
	lecturer: Lecturer;
}

export interface Lecturer {
	userId: string;
	isModerator: boolean;
	user: User;
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

	async getGroupsBySemester(
		semesterId: string,
	): Promise<ApiResponse<GroupWithDetails[]>> {
		const response = await httpClient.get<ApiResponse<GroupWithDetails[]>>(
			`${this.baseUrl}/${semesterId}/groups`,
		);
		return response.data;
	}
}

export const semesterService = new SemesterService();
export default semesterService;
