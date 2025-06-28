// Unified AuthService class for backward compatibility
import { signOut } from 'next-auth/react';

import { AdminAuthService } from '@/lib/services/auth/admin-auth.service';
import { TokenUtilsService } from '@/lib/services/auth/token-utils.service';
import { UserAuthService } from '@/lib/services/auth/user-auth.service';
import { TokenManager } from '@/lib/utils/auth/token-manager';

// Export all auth services from a single entry point
export { AdminAuthService } from '@/lib/services/auth/admin-auth.service';
export { UserAuthService } from '@/lib/services/auth/user-auth.service';
export { TokenUtilsService } from '@/lib/services/auth/token-utils.service';
export { AuthErrorHandler } from '@/lib/services/auth/auth-error-handler';
export { BaseAuthService } from '@/lib/services/auth/base-auth.service';

/**
 * Enhanced Unified Authentication Service
 * Provides a single interface for all authentication operations with remember me support
 * This maintains backward compatibility while using the new modular structure
 */
export class AuthService {
	// Admin methods
	static readonly adminLogin = AdminAuthService.login;
	static readonly adminRefresh = AdminAuthService.refresh;

	// User methods
	static readonly userLogin = UserAuthService.login;
	static readonly userRefresh = UserAuthService.refresh;

	// Token utility methods
	static readonly getUserFromToken = TokenUtilsService.getUserFromToken;
	static readonly isTokenExpired = TokenUtilsService.isTokenExpired;
	static readonly getTokenExpirationTime =
		TokenUtilsService.getTokenExpirationTime;
	static readonly getTimeUntilExpiration =
		TokenUtilsService.getTimeUntilExpiration;

	/**
	 * Logout: Clear tokens and NextAuth session with remember me support
	 */ static async logout(options?: { redirect?: boolean }): Promise<void> {
		try {
			// Check if this was a remember me session for logging
			const storageInfo = TokenManager.getStorageInfo();
			if (storageInfo.rememberMe) {
			}

			// Clear tokens from TokenManager (handles both localStorage and sessionStorage)
			TokenManager.clearTokens();

			// Clear NextAuth session
			await signOut({ redirect: options?.redirect ?? false });
		} catch (error) {
			console.error('Logout error:', error);
			// Still clear tokens even if signOut fails
			TokenManager.clearTokens();
			throw error;
		}
	}

	/**
	 * Get current storage information for debugging
	 */
	static getStorageInfo() {
		return TokenManager.getStorageInfo();
	}

	/**
	 * Switch remember me preference (for current session)
	 */
	static async switchRememberMe(rememberMe: boolean): Promise<boolean> {
		try {
			const accessToken = TokenManager.getAccessToken();
			const refreshToken = TokenManager.getRefreshToken();

			if (accessToken && refreshToken) {
				// Re-store tokens with new remember me preference
				TokenManager.setTokens(accessToken, refreshToken, rememberMe);

				return true;
			}

			return false;
		} catch (error) {
			console.error('Failed to switch remember me preference:', error);
			return false;
		}
	}

	/**
	 * Clear only expired tokens (smart cleanup)
	 */
	static clearExpiredTokens(): void {
		const storageInfo = TokenManager.getStorageInfo();
		if (storageInfo.hasTokens && !storageInfo.tokenValid) {
			TokenManager.clearTokens();
		}
	}

	/**
	 * Fast token check (without API call)
	 */
	static hasValidTokens(): boolean {
		const storageInfo = TokenManager.getStorageInfo();
		return storageInfo.hasTokens && storageInfo.tokenValid;
	}
}
