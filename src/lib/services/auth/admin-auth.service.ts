import {
	AdminLogin,
	RefreshToken,
	RefreshTokenData,
	TokenData,
} from '@/schemas/auth';

import { BaseAuthService } from './base-auth.service';

/**
 * 👩‍💼 Admin Authentication Service
 * Handles admin login and token refresh
 */
export class AdminAuthService extends BaseAuthService {
	/**
	 * 🔐 Admin Login
	 */
	static async login(credentials: AdminLogin): Promise<TokenData> {
		return super.performLogin('/auth/admin/login', credentials);
	}

	/**
	 * 🔄 Admin Token Refresh
	 */
	static async refresh(refreshToken: RefreshToken): Promise<RefreshTokenData> {
		return super.performRefresh('/auth/admin/refresh', refreshToken);
	}
}
