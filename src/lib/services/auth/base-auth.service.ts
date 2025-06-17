import httpClient from '../_httpClient';

import { TokenManager } from '@/lib/utils/auth/token-manager';
import {
	LoginResponseSchema,
	RefreshResponseSchema,
	RefreshToken,
	RefreshTokenData,
	TokenData,
} from '@/schemas/auth';

import { AuthErrorHandler } from './auth-error-handler';

/**
 * 🔐 Base Authentication Service
 * Shared functionality for both admin and user authentication
 */
export abstract class BaseAuthService {
	/**
	 * Generic login method
	 */
	protected static async performLogin(
		endpoint: string,
		credentials: unknown,
	): Promise<TokenData> {
		try {
			// Clear any existing tokens to prevent conflicts
			TokenManager.clearTokens();

			const response = await httpClient.post(endpoint, credentials);

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
	 * Generic token refresh method
	 */
	protected static async performRefresh(
		endpoint: string,
		refreshToken: RefreshToken,
	): Promise<RefreshTokenData> {
		try {
			const response = await httpClient.post(endpoint, refreshToken);

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
