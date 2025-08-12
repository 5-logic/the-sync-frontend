// Unified AuthService class for backward compatibility
import { signOut } from "next-auth/react";

import { AdminAuthService } from "@/lib/services/auth/admin-auth.service";
import { PasswordService } from "@/lib/services/auth/password.service";
import { TokenUtilsService } from "@/lib/services/auth/token-utils.service";
import { UserAuthService } from "@/lib/services/auth/user-auth.service";
import { TokenManager } from "@/lib/utils/auth/token-manager";

// Export all auth services from a single entry point
export { AdminAuthService } from "@/lib/services/auth/admin-auth.service";
export { UserAuthService } from "@/lib/services/auth/user-auth.service";
export { TokenUtilsService } from "@/lib/services/auth/token-utils.service";
export { PasswordService } from "@/lib/services/auth/password.service";
export { AuthErrorHandler } from "@/lib/services/auth/auth-error-handler";
export { BaseAuthService } from "@/lib/services/auth/base-auth.service";

/**
 * Enhanced Unified Authentication Service
 * Provides a single interface for all authentication operations with remember me support
 * This maintains backward compatibility while using the new modular structure
 */
export class AuthService {
	// Admin methods
	static readonly adminLogin = AdminAuthService.login;
	static readonly adminRefresh = AdminAuthService.refresh;
	static readonly adminLogout = AdminAuthService.logout;

	// User methods
	static readonly userLogin = UserAuthService.login;
	static readonly userRefresh = UserAuthService.refresh;
	static readonly userLogout = UserAuthService.logout;

	// Token utility methods
	static readonly getUserFromToken = TokenUtilsService.getUserFromToken;
	static readonly isTokenExpired = TokenUtilsService.isTokenExpired;
	static readonly getTokenExpirationTime =
		TokenUtilsService.getTokenExpirationTime;
	static readonly getTimeUntilExpiration =
		TokenUtilsService.getTimeUntilExpiration;

	// Password methods
	static readonly changePassword = PasswordService.changePassword;
	static readonly requestPasswordReset = PasswordService.requestPasswordReset;
	static readonly verifyOtpAndResetPassword =
		PasswordService.verifyOtpAndResetPassword;

	/**
	 * Enhanced Logout: Clear all storage and call appropriate backend logout endpoint
	 */
	static async logout(options?: { redirect?: boolean }): Promise<void> {
		try {
			// Determine user role to call appropriate logout endpoint
			const accessToken = TokenManager.getAccessToken();
			let userRole: string | null = null;

			if (accessToken) {
				const userInfo = this.getUserFromToken(accessToken);
				userRole = userInfo?.role || null;
			}

			// Clear everything from browser storage first
			TokenManager.clearAllStorage();

			// Call appropriate backend logout endpoint
			if (userRole === "admin") {
				try {
					await this.adminLogout();
				} catch (error) {
					console.warn("Admin logout API call failed:", error);
				}
			} else if (
				userRole &&
				["student", "lecturer", "moderator"].includes(userRole)
			) {
				try {
					await this.userLogout();
				} catch (error) {
					console.warn("User logout API call failed:", error);
				}
			}

			// Clear NextAuth session
			await signOut({ redirect: options?.redirect ?? false });
		} catch (error) {
			console.error("Logout error:", error);
			// Ensure all storage is cleared even if something fails
			TokenManager.clearAllStorage();
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
			console.error("Failed to switch remember me preference:", error);
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
