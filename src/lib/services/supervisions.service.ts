import httpClient from '@/lib/services/_httpClient';
import { ApiResponse } from '@/schemas/_common';
import {
	type AssignSupervisorRequest,
	type BulkAssignmentApiResponse,
	type BulkAssignmentRequest,
	type ChangeSupervisorRequest,
	type Supervision,
} from '@/schemas/supervision';

class SupervisionService {
	private readonly baseUrl = '/supervisions';

	/**
	 * Get supervisions by thesis ID
	 */
	async getByThesisId(thesisId: string): Promise<ApiResponse<Supervision[]>> {
		const response = await httpClient.get<ApiResponse<Supervision[]>>(
			`${this.baseUrl}/thesis/${thesisId}`,
		);
		return response.data;
	}

	/**
	 * Assign supervisor to thesis
	 */
	async assignSupervisor(
		thesisId: string,
		data: AssignSupervisorRequest,
	): Promise<ApiResponse<Supervision>> {
		const response = await httpClient.post<ApiResponse<Supervision>>(
			`${this.baseUrl}/assign/${thesisId}`,
			data,
		);
		return response.data;
	}

	/**
	 * Change thesis supervisor
	 */
	async changeSupervisor(
		thesisId: string,
		data: ChangeSupervisorRequest,
	): Promise<ApiResponse<Supervision>> {
		const response = await httpClient.put<ApiResponse<Supervision>>(
			`${this.baseUrl}/change/${thesisId}`,
			data,
		);
		return response.data;
	}

	/**
	 * Bulk assign supervisors to multiple theses
	 */
	async bulkAssignSupervisors(
		data: BulkAssignmentRequest,
	): Promise<ApiResponse<BulkAssignmentApiResponse>> {
		const response = await httpClient.post<
			ApiResponse<BulkAssignmentApiResponse>
		>(`${this.baseUrl}/assign-supervisors`, data);
		return response.data;
	}
}

export const supervisionService = new SupervisionService();
export default supervisionService;
