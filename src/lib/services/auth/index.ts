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
 * 🔐 Unified Authentication Service
 * Provides a single interface for all authentication operations
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
	 * 🚪 Logout: Clear tokens and NextAuth session
	 */ static async logout(options?: { redirect?: boolean }): Promise<void> {
		try {
			// Clear tokens from storage
			TokenManager.clearTokens();

			// Clear NextAuth session
			await signOut({ redirect: options?.redirect ?? false });
		} catch (error) {
			console.error('❌ Logout error:', error);
			// Still clear tokens even if signOut fails
			TokenManager.clearTokens();
			throw error;
		}
	}
}
