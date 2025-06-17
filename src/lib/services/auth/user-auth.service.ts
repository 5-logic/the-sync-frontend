import httpClient from '../_httpClient';

import { TokenManager } from '@/lib/auth/token-manager';
import {
	LoginResponseSchema,
	RefreshResponseSchema,
	RefreshToken,
	RefreshTokenData,
	TokenData,
	UserLogin,
} from '@/schemas/auth';

import { AuthErrorHandler } from './auth-error-handler';

/**
 * 👤 User Authentication Service
 * Handles user (student/lecturer) login and token refresh
 */
export class UserAuthService {
	/**
	 * 🔐 User Login (Student/Lecturer)
	 */
	static async login(credentials: UserLogin): Promise<TokenData> {
		try {
			// Clear any existing tokens to prevent conflicts
			TokenManager.clearTokens();

			const response = await httpClient.post('/auth/user/login', credentials);

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
	 * 🔄 User Token Refresh
	 */ static async refresh(
		refreshToken: RefreshToken,
	): Promise<RefreshTokenData> {
		try {
			const response = await httpClient.post(
				'/auth/user/refresh',
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
