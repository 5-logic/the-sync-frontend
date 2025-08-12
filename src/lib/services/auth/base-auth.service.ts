import httpClient from "@/lib/services/_httpClient";
import { AuthErrorHandler } from "@/lib/services/auth/auth-error-handler";
import { TokenManager } from "@/lib/utils/auth/token-manager";
import {
	LoginResponseSchema,
	RefreshResponseSchema,
	RefreshToken,
	RefreshTokenData,
	TokenData,
} from "@/schemas/auth";

/**
 * Base Authentication Service
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

	/**
	 * Generic logout method
	 */
	protected static async performLogout(endpoint: string): Promise<void> {
		try {
			// Get current access token to send with logout request
			const accessToken = TokenManager.getAccessToken();

			// Even if no token, we should still call the logout endpoint
			// to ensure server-side cleanup
			await httpClient.post(
				endpoint,
				{},
				{
					headers: accessToken
						? {
								Authorization: `Bearer ${accessToken}`,
							}
						: {},
				},
			);

			// Clear tokens after successful logout
			TokenManager.clearTokens();
		} catch (error: unknown) {
			// Even if logout request fails, clear local tokens
			TokenManager.clearTokens();
			console.warn("Logout request failed, but tokens cleared locally:", error);
		}
	}
}
