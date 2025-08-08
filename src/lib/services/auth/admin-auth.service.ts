import { BaseAuthService } from "@/lib/services/auth/base-auth.service";
import {
	AdminLogin,
	RefreshToken,
	RefreshTokenData,
	TokenData,
} from "@/schemas/auth";

/**
 * Admin Authentication Service
 * Handles admin login and token refresh
 */
export class AdminAuthService extends BaseAuthService {
	/**
	 * Admin Login
	 */
	static async login(credentials: AdminLogin): Promise<TokenData> {
		return super.performLogin("/auth/admin/login", credentials);
	}

	/**
	 * Admin Token Refresh
	 */
	static async refresh(refreshToken: RefreshToken): Promise<RefreshTokenData> {
		return super.performRefresh("/auth/admin/refresh", refreshToken);
	}

	/**
	 * Admin Logout
	 */
	static async logout(): Promise<void> {
		return super.performLogout("/auth/admin/logout");
	}
}
