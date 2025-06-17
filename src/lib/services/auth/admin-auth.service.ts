import httpClient from '../_httpClient';

import { TokenManager } from '@/lib/auth/token-manager';
import {
	AdminLogin,
	LoginResponseSchema,
	RefreshResponseSchema,
	RefreshToken,
	RefreshTokenData,
	TokenData,
} from '@/schemas/auth';

import { AuthErrorHandler } from './auth-error-handler';

/**
 * 👩‍💼 Admin Authentication Service
 * Handles admin login and token refresh
 */
export class AdminAuthService {
	/**
	 * 🔐 Admin Login
	 */
	static async login(credentials: AdminLogin): Promise<TokenData> {
		try {
			// Clear any existing tokens to prevent conflicts
			TokenManager.clearTokens();

			const response = await httpClient.post('/auth/admin/login', credentials);

			// Validate response with schema
			const parsed = LoginResponseSchema.parse(response.data);
			if (!parsed.success) {
				throw new Error(parsed.error);
			}

			return parsed.data;
		} catch (error: unknown) {
			AuthErrorHandler.handleLoginError(error);
		}
	}

	/**
	 * 🔄 Admin Token Refresh
	 */ static async refresh(
		refreshToken: RefreshToken,
	): Promise<RefreshTokenData> {
		try {
			const response = await httpClient.post(
				'/auth/admin/refresh',
				refreshToken,
			);

			// Validate response with schema
			const parsed = RefreshResponseSchema.parse(response.data);
			if (!parsed.success) {
				throw new Error(parsed.error);
			}

			return parsed.data;
		} catch (error: unknown) {
			AuthErrorHandler.handleRefreshError(error);
		}
	}
}
