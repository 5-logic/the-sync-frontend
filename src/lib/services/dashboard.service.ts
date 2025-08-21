import httpClient from "@/lib/services/_httpClient";

export interface SummaryCard {
	totalStudents: number;
	totalLecturers: number;
	totalTheses: number;
	totalGroups: number;
}

export interface ProgressOverview {
	totalStudentGrouped: number;
	totalGroupPickedThesis: number;
	thesisPublished: number;
	totalAssignedSupervisors: number;
}

export interface SupervisorLoadDistribution {
	lecturerId: string;
	fullName: string;
	thesisCount: number;
	rawThesisCount: number;
}

export interface DashboardStatistics {
	summaryCard: SummaryCard;
	progressOverview: ProgressOverview;
	supervisorLoadDistribution: SupervisorLoadDistribution[];
}

export interface DashboardStatisticsResponse {
	success: boolean;
	statusCode: number;
	data: DashboardStatistics;
}

export class DashboardService {
	/**
	 * Get dashboard statistics for a specific semester
	 */
	static async getSemesterStatistics(
		semesterId: string,
	): Promise<DashboardStatistics> {
		const response = await httpClient.get<DashboardStatisticsResponse>(
			`/semesters/${semesterId}/statistics`,
		);
		return response.data.data;
	}
}
