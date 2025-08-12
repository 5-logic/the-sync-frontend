import { getSession } from "next-auth/react";

import { AdminAuthService } from "@/lib/services/auth/admin-auth.service";
import { TokenUtilsService } from "@/lib/services/auth/token-utils.service";
import { UserAuthService } from "@/lib/services/auth/user-auth.service";
import { CookieUtils } from "@/lib/utils/auth/cookie-utils";

/**
 * Handles conditional storage based on remember me preference
 * Enhanced with security features and automatic cleanup
 * Aligned with backend token settings (1h access, 1w refresh)
 */
export class TokenManager {
	private static readonly ACCESS_TOKEN_KEY = "accessToken";
	private static readonly REFRESH_TOKEN_KEY = "refreshToken";
	private static readonly REMEMBER_ME_KEY = "rememberMe";
	private static readonly STORAGE_VERSION_KEY = "tokenStorageVersion";
	private static readonly CURRENT_VERSION = "1.0";

	// Throttling mechanism to prevent multiple simultaneous refresh calls
	private static refreshPromise: Promise<string | null> | null = null;
	private static lastRefreshTime: number = 0;
	private static readonly REFRESH_THROTTLE_MS = 5000; // 5 seconds minimum between refresh attempts

	/**
	 * Set tokens with conditional storage strategy
	 */
	static setTokens(
		accessToken: string,
		refreshToken: string,
		rememberMe: boolean = false,
	): void {
		if (typeof window === "undefined") return;

		try {
			// Clear any existing tokens first
			this.clearTokens();

			if (rememberMe) {
				// PERSISTENT: Use localStorage for remember me
				localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
				localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
				localStorage.setItem(this.REMEMBER_ME_KEY, "true");
				localStorage.setItem(this.STORAGE_VERSION_KEY, this.CURRENT_VERSION);

				// Set expiration timestamp aligned with backend (7 days)
				const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
				localStorage.setItem("tokenExpiresAt", expiresAt.toString());
			} else {
				// SESSION-ONLY: Use sessionStorage
				sessionStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
				sessionStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
				sessionStorage.setItem(this.REMEMBER_ME_KEY, "false");
			}
		} catch (error) {
			console.error("Failed to store tokens:", error);
			// Fallback to sessionStorage
			this.fallbackToSessionStorage(accessToken, refreshToken);
		}
	}

	/**
	 * Get access token from appropriate storage
	 */
	static getAccessToken(): string | null {
		if (typeof window === "undefined") return null;

		try {
			// Check if remember me is enabled
			const isRememberMe = this.getRememberMePreference();

			if (isRememberMe) {
				// Check localStorage first (persistent storage)
				const localToken = localStorage.getItem(this.ACCESS_TOKEN_KEY);
				if (localToken && this.isStorageValid()) {
					return localToken;
				}

				// If localStorage token is invalid, clear everything
				if (localToken && !this.isStorageValid()) {
					this.clearPersistentStorage();
				}
			}

			// Fallback to sessionStorage
			return sessionStorage.getItem(this.ACCESS_TOKEN_KEY);
		} catch (error) {
			console.error("Failed to get access token:", error);
			return null;
		}
	}

	/**
	 * Get refresh token from appropriate storage
	 */
	static getRefreshToken(): string | null {
		if (typeof window === "undefined") return null;

		try {
			const isRememberMe = this.getRememberMePreference();

			if (isRememberMe) {
				const localToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
				if (localToken && this.isStorageValid()) {
					return localToken;
				}

				if (localToken && !this.isStorageValid()) {
					this.clearPersistentStorage();
				}
			}

			return sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
		} catch (error) {
			console.error("Failed to get refresh token:", error);
			return null;
		}
	}

	/**
	 * Get remember me preference
	 */
	static getRememberMePreference(): boolean {
		if (typeof window === "undefined") return false;

		try {
			// Check localStorage first (persistent preference)
			const localPref = localStorage.getItem(this.REMEMBER_ME_KEY);
			if (localPref === "true") return true;

			// Check sessionStorage (session preference)
			const sessionPref = sessionStorage.getItem(this.REMEMBER_ME_KEY);
			return sessionPref === "true";
		} catch {
			return false;
		}
	}

	/**
	 * Fast token validation without API call
	 * Adjusted for backend access token lifetime (1 hour)
	 */
	static isTokenValid(token: string): boolean {
		try {
			if (!token || typeof token !== "string") return false;

			const parts = token.split(".");
			if (parts.length !== 3) return false;

			const payload = JSON.parse(atob(parts[1]));
			const currentTime = Math.floor(Date.now() / 1000);

			// UPDATED: Check if token is expired (with 30 second buffer for 1-hour tokens)
			return payload.exp && payload.exp > currentTime + 30;
		} catch {
			return false;
		}
	}

	/**
	 * Fast access token check with smart fallback
	 */
	static getFastAccessToken(): string | null {
		const accessToken = this.getAccessToken();
		if (!accessToken) return null;

		// Fast validation without API call
		if (this.isTokenValid(accessToken)) {
			return accessToken;
		}

		// If token is invalid, clear it
		this.clearInvalidTokens();
		return null;
	}

	/**
	 * Get valid access token (refresh if needed)
	 */
	static async getValidAccessToken(): Promise<string | null> {
		const accessToken = this.getAccessToken();

		// No token available
		if (!accessToken) return null;

		// Token is still valid
		if (!TokenUtilsService.isTokenExpired(accessToken)) {
			return accessToken;
		}

		// Token expired, check if we have a refresh token
		const refreshToken = this.getRefreshToken();
		if (!refreshToken) return null;

		// Try to refresh token
		return await this.refreshAccessToken();
	}

	/**
	 * Refresh access token with smart storage and throttling
	 */
	static async refreshAccessToken(): Promise<string | null> {
		// Return existing promise if refresh is already in progress
		if (this.refreshPromise) {
			console.log("🔄 Refresh already in progress, waiting...");
			return this.refreshPromise;
		}

		// Check throttling - prevent too frequent refresh attempts
		const now = Date.now();
		if (now - this.lastRefreshTime < this.REFRESH_THROTTLE_MS) {
			console.log("🚫 Refresh throttled, too soon since last attempt");
			return null;
		}

		// Create and store the refresh promise
		this.refreshPromise = this._performTokenRefresh();
		this.lastRefreshTime = now;

		try {
			const result = await this.refreshPromise;
			return result;
		} finally {
			// Clear the promise when done (success or failure)
			this.refreshPromise = null;
		}
	}

	/**
	 * Internal method to perform the actual token refresh
	 */
	private static async _performTokenRefresh(): Promise<string | null> {
		try {
			const refreshToken = this.getRefreshToken();
			if (!refreshToken) {
				throw new Error("No refresh token available");
			}

			// Check if refresh token is expired
			if (TokenUtilsService.isTokenExpired(refreshToken)) {
				throw new Error("Refresh token expired");
			}

			// Get current session to determine user type
			const session = await getSession();
			const isAdmin = session?.user?.role === "admin";
			const rememberMe = this.getRememberMePreference();

			try {
				console.log("🔄 Calling backend refresh endpoint...");

				// Call appropriate refresh endpoint
				const tokenData = isAdmin
					? await AdminAuthService.refresh({ refreshToken })
					: await UserAuthService.refresh({ refreshToken });

				// Update only access token, keep existing refresh token and remember preference
				this.setTokens(tokenData.accessToken, refreshToken, rememberMe);

				console.log("✅ Token refreshed successfully");
				return tokenData.accessToken;
			} catch (apiError) {
				// Handle API errors gracefully
				if (
					apiError instanceof Error &&
					(apiError.message.includes("404") ||
						apiError.message.includes("not found") ||
						apiError.message.includes("Not Found"))
				) {
					throw new Error("Token refresh not supported by backend");
				}
				throw apiError;
			}
		} catch (error) {
			console.error("❌ Token refresh failed:", error);
			// Don't clear tokens immediately - let user re-login naturally
			return null;
		}
	}

	/**
	 * Clear all tokens and preferences
	 */
	static clearTokens(): void {
		if (typeof window === "undefined") return;

		try {
			// Clear localStorage
			this.clearPersistentStorage();

			// Clear sessionStorage
			this.clearSessionStorage();

			// Clear throttling state
			this.clearRefreshState();
		} catch (error) {
			console.error("Failed to clear tokens:", error);
		}
	}

	/**
	 * Clear ALL storage including cookies, localStorage, sessionStorage
	 */
	static clearAllStorage(): void {
		if (typeof window === "undefined") return;

		try {
			// Clear our tokens and preferences
			this.clearTokens();

			// Clear all localStorage
			localStorage.clear();

			// Clear all sessionStorage
			sessionStorage.clear();

			// Clear all cookies by setting them to expire
			CookieUtils.clearAllCookies();
		} catch (error) {
			console.error("Failed to clear all storage:", error);
		}
	}

	/**
	 * Clear refresh throttling state
	 */
	static clearRefreshState(): void {
		this.refreshPromise = null;
		this.lastRefreshTime = 0;
	}

	/**
	 * Clear only persistent storage (localStorage)
	 */
	static clearPersistentStorage(): void {
		if (typeof window === "undefined") return;

		localStorage.removeItem(this.ACCESS_TOKEN_KEY);
		localStorage.removeItem(this.REFRESH_TOKEN_KEY);
		localStorage.removeItem(this.REMEMBER_ME_KEY);
		localStorage.removeItem(this.STORAGE_VERSION_KEY);
		localStorage.removeItem("tokenExpiresAt");
	}

	/**
	 * Clear only session storage
	 */
	static clearSessionStorage(): void {
		if (typeof window === "undefined") return;

		sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
		sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
		sessionStorage.removeItem(this.REMEMBER_ME_KEY);
	}

	/**
	 * Check if persistent storage is valid
	 * Uses 7-day expiration aligned with backend
	 */
	private static isStorageValid(): boolean {
		try {
			// Check storage version
			const version = localStorage.getItem(this.STORAGE_VERSION_KEY);
			if (version !== this.CURRENT_VERSION) {
				return false;
			}

			// Check expiration timestamp for security (7 days)
			const expiresAt = localStorage.getItem("tokenExpiresAt");
			if (expiresAt && Date.now() > parseInt(expiresAt)) {
				return false;
			}

			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Clear only invalid tokens
	 */
	private static clearInvalidTokens(): void {
		const isRememberMe = this.getRememberMePreference();

		if (isRememberMe) {
			// Clear localStorage tokens but keep preference
			localStorage.removeItem(this.ACCESS_TOKEN_KEY);
			localStorage.removeItem(this.REFRESH_TOKEN_KEY);
		} else {
			// Clear sessionStorage tokens
			sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
			sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
		}
	}

	/**
	 * Fallback to sessionStorage if localStorage fails
	 */
	private static fallbackToSessionStorage(
		accessToken: string,
		refreshToken: string,
	): void {
		try {
			sessionStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
			sessionStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
			sessionStorage.setItem(this.REMEMBER_ME_KEY, "false");
		} catch (fallbackError) {
			console.error(
				"Critical: Both localStorage and sessionStorage failed",
				fallbackError,
			);
		}
	}

	/**
	 * Get storage info for debugging
	 */
	static getStorageInfo(): {
		hasTokens: boolean;
		rememberMe: boolean;
		storageType: "localStorage" | "sessionStorage" | "none";
		tokenValid: boolean;
		refreshState: {
			inProgress: boolean;
			lastRefresh: string | null;
			throttled: boolean;
		};
	} {
		const accessToken = this.getAccessToken();
		const rememberMe = this.getRememberMePreference();

		let storageType: "localStorage" | "sessionStorage" | "none" = "none";

		if (rememberMe && localStorage.getItem(this.ACCESS_TOKEN_KEY)) {
			storageType = "localStorage";
		} else if (sessionStorage.getItem(this.ACCESS_TOKEN_KEY)) {
			storageType = "sessionStorage";
		}

		const now = Date.now();
		const timeSinceLastRefresh = now - this.lastRefreshTime;

		return {
			hasTokens: !!accessToken,
			rememberMe,
			storageType,
			tokenValid: accessToken ? this.isTokenValid(accessToken) : false,
			refreshState: {
				inProgress: !!this.refreshPromise,
				lastRefresh:
					this.lastRefreshTime > 0
						? new Date(this.lastRefreshTime).toISOString()
						: null,
				throttled: timeSinceLastRefresh < this.REFRESH_THROTTLE_MS,
			},
		};
	}
}
