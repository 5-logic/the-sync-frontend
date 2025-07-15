import httpClient from '@/lib/services/_httpClient';
import { ApiResponse } from '@/schemas/_common';
import { Admin } from '@/schemas/admin';

class AdminService {
	private readonly baseUrl = '/admins';

	async findOne(id: string): Promise<ApiResponse<Admin>> {
		const response = await httpClient.get<ApiResponse<Admin>>(
			`${this.baseUrl}/${id}`,
		);
		return response.data;
	}

	async update(
		id: string,
		updateAdminDto: Partial<Admin>,
	): Promise<ApiResponse<Admin>> {
		const response = await httpClient.put<ApiResponse<Admin>>(
			`${this.baseUrl}/${id}`,
			updateAdminDto,
		);
		return response.data;
	}
}

const adminService = new AdminService();
export default adminService;
