import { getSession } from 'next-auth/react';

import { AuthService } from '@/lib/services/auth';

export class TokenManager {
	private static readonly ACCESS_TOKEN_KEY = 'accessToken';
	private static readonly REFRESH_TOKEN_KEY = 'refreshToken';

	// 💾 Store tokens in sessionStorage (more secure than localStorage for auth)
	static setTokens(accessToken: string, refreshToken: string): void {
		if (typeof window !== 'undefined') {
			sessionStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
			sessionStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
		}
	}

	static getAccessToken(): string | null {
		if (typeof window !== 'undefined') {
			return sessionStorage.getItem(this.ACCESS_TOKEN_KEY);
		}
		return null;
	}

	static getRefreshToken(): string | null {
		if (typeof window !== 'undefined') {
			return sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
		}
		return null;
	} // 🔄 Fast token validation (without API call)
	static isTokenValid(token: string): boolean {
		try {
			// Quick format check
			if (!token || typeof token !== 'string') return false;

			// Check if token has proper JWT format (3 parts separated by dots)
			const parts = token.split('.');
			if (parts.length !== 3) return false;

			// Decode payload to check expiration
			const payload = JSON.parse(atob(parts[1]));
			const currentTime = Math.floor(Date.now() / 1000);

			// Check if token is expired (with 30 second buffer)
			return payload.exp && payload.exp > currentTime + 30;
		} catch {
			return false;
		}
	}

	// 🚀 Fast access token check (prioritizes cached validation)
	static getFastAccessToken(): string | null {
		const accessToken = this.getAccessToken();
		if (!accessToken) return null;

		// Fast validation without API call
		if (this.isTokenValid(accessToken)) {
			return accessToken;
		}
		return null;
	}

	static clearTokens(): void {
		if (typeof window !== 'undefined') {
			sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
			sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
		}
	}

	// 🔄 Refresh token and update storage
	static async refreshAccessToken(): Promise<string | null> {
		try {
			const refreshToken = this.getRefreshToken();
			if (!refreshToken) {
				throw new Error('No refresh token available');
			}

			// Check if refresh token is expired
			if (AuthService.isTokenExpired(refreshToken)) {
				throw new Error('Refresh token expired');
			} // Get current session to determine user type
			const session = await getSession();
			const isAdmin = session?.user?.role === 'admin';

			try {
				// Call appropriate refresh endpoint
				const tokenData = isAdmin
					? await AuthService.adminRefresh({ refreshToken })
					: await AuthService.userRefresh({ refreshToken });

				// Update only access token, keep existing refresh token
				const currentRefreshToken = this.getRefreshToken();
				if (currentRefreshToken) {
					this.setTokens(tokenData.accessToken, currentRefreshToken);
				}
				return tokenData.accessToken;
			} catch (apiError) {
				// If refresh endpoints don't exist (404) or are not implemented
				if (
					apiError instanceof Error &&
					(apiError.message.includes('404') ||
						apiError.message.includes('not found') ||
						apiError.message.includes('Not Found'))
				) {
					throw new Error('Token refresh not supported by backend');
				}
				throw apiError;
			}
		} catch {
			// Don't clear tokens immediately - let user re-login
			return null;
		}
	}
	// ✅ Get valid access token (refresh if needed)
	static async getValidAccessToken(): Promise<string | null> {
		const accessToken = this.getAccessToken();
		// No token available
		if (!accessToken) {
			return null;
		}
		// Token is still valid
		if (!AuthService.isTokenExpired(accessToken)) {
			return accessToken;
		}
		// Token expired, check if we have a refresh token before attempting refresh
		const refreshToken = this.getRefreshToken();
		if (!refreshToken) {
			return null;
		}

		// Token expired, try to refresh
		return await this.refreshAccessToken();
	}
}
