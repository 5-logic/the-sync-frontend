import httpClient from '@/lib/services/_httpClient';
import { ApiResponse } from '@/schemas/_common';
import {
	CreateMultipleGroupsRequest,
	CreatedGroup,
	GroupDashboard,
} from '@/schemas/group';

// Group interfaces
export interface GroupCreate {
	name: string;
	projectDirection?: string;
	skillIds?: string[];
	responsibilityIds?: string[];
}

export interface GroupUpdate {
	name?: string;
	projectDirection?: string;
	skillIds?: string[];
	responsibilityIds?: string[];
}

// Group Responsibility Average interface
export interface GroupResponsibilityAverage {
	responsibilityId: string;
	responsibilityName: string;
	averageLevel: number;
}

export interface Group {
	id: string;
	code: string;
	name: string;
	projectDirection?: string;
	createdAt: string;
	updatedAt: string;
	semester: {
		id: string;
		name: string;
		code: string;
		status: string;
	};
	memberCount: number;
	skillCount: number;
	responsibilityCount: number;
	leader: {
		student: {
			userId: string;
			studentCode: string;
			user: {
				id: string;
				fullName: string;
			};
		};
	};
}

export interface MilestoneSubmission {
	id: string;
	groupId: string;
	milestoneId: string;
	documents: string[];
	status: 'Submitted' | 'Not Submitted';
	createdAt: string;
	updatedAt: string;
	milestone: {
		id: string;
		name: string;
		startDate: string;
		endDate: string;
	};
	assignmentReviews: unknown[];
	reviews: unknown[];
}

// Interface for formatted group response
export interface FormattedGroup {
	id: string;
	code: string;
	name: string;
	projectDirection?: string;
	semesterId: string;
	thesisId?: string;
	studentCount: number;
	students: Array<{
		studentCode: string;
		fullName: string;
	}>;
	createdAt: string;
	updatedAt: string;
}

// Interface for the new supervise API response
export interface SupervisedGroup {
	id: string;
	code: string;
	name: string;
	projectDirection?: string;
	semesterId: string;
	thesisId: string;
	createdAt: string;
	updatedAt: string;
	thesis: {
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
		lecturer: {
			userId: string;
			isModerator: boolean;
			user: {
				id: string;
				fullName: string;
				email: string;
				password: string;
				gender: string;
				phoneNumber: string;
				isActive: boolean;
				createdAt: string;
				updatedAt: string;
			};
		};
	};
	semester: {
		id: string;
		name: string;
		code: string;
		maxGroup: number;
		status: string;
		ongoingPhase: string | null;
		defaultThesesPerLecturer: number;
		maxThesesPerLecturer: number;
		createdAt: string;
		updatedAt: string;
	};
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
				password: string;
				gender: string;
				phoneNumber: string;
				isActive: boolean;
				createdAt: string;
				updatedAt: string;
			};
			major: {
				id: string;
				name: string;
				code: string;
				createdAt: string;
				updatedAt: string;
			};
		};
	}>;
}

class GroupService {
	private readonly baseUrl = '/groups';

	async create(createGroupDto: GroupCreate): Promise<ApiResponse<Group>> {
		const response = await httpClient.post<ApiResponse<Group>>(
			this.baseUrl,
			createGroupDto,
		);
		return response.data;
	}

	async findAll(): Promise<ApiResponse<Group[]>> {
		const response = await httpClient.get<ApiResponse<Group[]>>(this.baseUrl);
		return response.data;
	}

	async findOne(id: string): Promise<ApiResponse<GroupDashboard>> {
		const response = await httpClient.get<ApiResponse<GroupDashboard>>(
			`${this.baseUrl}/${id}`,
		);
		return response.data;
	}

	async update(
		id: string,
		updateGroupDto: GroupUpdate,
	): Promise<ApiResponse<GroupDashboard>> {
		const response = await httpClient.put<ApiResponse<GroupDashboard>>(
			`${this.baseUrl}/${id}`,
			updateGroupDto,
		);
		return response.data;
	}

	async getStudentGroup(): Promise<ApiResponse<GroupDashboard[]>> {
		const response = await httpClient.get<ApiResponse<GroupDashboard[]>>(
			`${this.baseUrl}/student`,
		);
		return response.data;
	}

	async getStudentGroupById(
		studentId: string,
	): Promise<ApiResponse<GroupDashboard[]>> {
		const response = await httpClient.get<ApiResponse<GroupDashboard[]>>(
			`${this.baseUrl}/student/${studentId}`,
		);
		return response.data;
	}

	async getPublicGroupDetail(
		groupId: string,
	): Promise<ApiResponse<GroupDashboard>> {
		const response = await httpClient.get<ApiResponse<GroupDashboard>>(
			`${this.baseUrl}/${groupId}`,
		);
		return response.data;
	}

	async leaveGroup(groupId: string): Promise<ApiResponse<void>> {
		const response = await httpClient.put<ApiResponse<void>>(
			`${this.baseUrl}/${groupId}/leave`,
		);
		return response.data;
	}

	async deleteGroup(groupId: string): Promise<ApiResponse<void>> {
		const response = await httpClient.delete<ApiResponse<void>>(
			`${this.baseUrl}/${groupId}`,
		);
		return response.data;
	}

	async removeMember(
		groupId: string,
		studentId: string,
	): Promise<ApiResponse<void>> {
		const response = await httpClient.put<ApiResponse<void>>(
			`${this.baseUrl}/${groupId}/remove-student`,
			{ studentId },
		);
		return response.data;
	}

	async changeLeader(
		groupId: string,
		newLeaderId: string,
	): Promise<ApiResponse<void>> {
		const response = await httpClient.put<ApiResponse<void>>(
			`${this.baseUrl}/${groupId}/change-leader`,
			{ newLeaderId },
		);
		return response.data;
	}

	async assignStudent(
		groupId: string,
		studentId: string,
	): Promise<ApiResponse<void>> {
		const response = await httpClient.put<ApiResponse<void>>(
			`${this.baseUrl}/${groupId}/assign-student`,
			{ studentId },
		);
		return response.data;
	}

	async pickThesis(
		groupId: string,
		thesisId: string,
	): Promise<ApiResponse<void>> {
		const response = await httpClient.put<ApiResponse<void>>(
			`${this.baseUrl}/${groupId}/pick-thesis`,
			{ thesisId },
		);
		return response.data;
	}

	async unpickThesis(groupId: string): Promise<ApiResponse<void>> {
		const response = await httpClient.put<ApiResponse<void>>(
			`${this.baseUrl}/${groupId}/unpick-thesis`,
		);
		return response.data;
	}

	async submitMilestone(
		groupId: string,
		milestoneId: string,
		documents: string[],
	): Promise<ApiResponse<void>> {
		const response = await httpClient.post<ApiResponse<void>>(
			`${this.baseUrl}/${groupId}/milestones/${milestoneId}`,
			{ documents },
		);
		return response.data;
	}

	async updateMilestoneSubmission(
		groupId: string,
		milestoneId: string,
		documents: string[],
	): Promise<ApiResponse<void>> {
		const response = await httpClient.put<ApiResponse<void>>(
			`${this.baseUrl}/${groupId}/milestones/${milestoneId}`,
			{ documents },
		);
		return response.data;
	}

	async getSubmissions(
		groupId: string,
	): Promise<ApiResponse<MilestoneSubmission[]>> {
		const response = await httpClient.get<ApiResponse<MilestoneSubmission[]>>(
			`${this.baseUrl}/${groupId}/submissions`,
		);
		return response.data;
	}

	async findSuperviseGroupsBySemester(
		semesterId: string,
	): Promise<ApiResponse<SupervisedGroup[]>> {
		const response = await httpClient.get<ApiResponse<SupervisedGroup[]>>(
			`${this.baseUrl}/supervise/semester/${semesterId}`,
		);
		return response.data;
	}

	/**
	 * Create multiple empty groups for a semester (Admin only)
	 * POST /groups/admin
	 */
	async createMultipleGroups(
		createRequest: CreateMultipleGroupsRequest,
	): Promise<ApiResponse<CreatedGroup[]>> {
		const response = await httpClient.post<ApiResponse<CreatedGroup[]>>(
			`${this.baseUrl}/admin`,
			createRequest,
		);
		return response.data;
	}

	/**
	 * Delete an empty group (Admin only)
	 * DELETE /groups/admin/{groupId}
	 * Only allows deletion of empty groups (groups with no student participations)
	 * Returns: {"success":true,"statusCode":200,"data":true} on success
	 */
	async deleteGroupAdmin(groupId: string): Promise<ApiResponse<boolean>> {
		const response = await httpClient.delete<ApiResponse<boolean>>(
			`${this.baseUrl}/admin/${groupId}`,
		);
		return response.data;
	}

	/**
	 * Format and reorganize all groups in a semester (Admin only)
	 * PUT /groups/admin/format/{semesterId}
	 * Reorganizes all existing groups in the semester by priority and updates their codes
	 */
	async formatGroupsInSemester(
		semesterId: string,
	): Promise<ApiResponse<FormattedGroup[]>> {
		const response = await httpClient.put<ApiResponse<FormattedGroup[]>>(
			`${this.baseUrl}/admin/format/${semesterId}`,
		);
		return response.data;
	}

	/**
	 * Get group responsibilities average levels
	 * GET /groups/{id}/responsibilities
	 * Returns average responsibility levels for all members in the group
	 */
	async getGroupResponsibilities(
		groupId: string,
	): Promise<ApiResponse<GroupResponsibilityAverage[]>> {
		const response = await httpClient.get<
			ApiResponse<GroupResponsibilityAverage[]>
		>(`${this.baseUrl}/${groupId}/responsibilities`);
		return response.data;
	}
}

const groupService = new GroupService();
export default groupService;
