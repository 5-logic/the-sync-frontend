/**
 * 🔧 Token Utilities Service
 * JWT token parsing and validation utilities
 */
export class TokenUtilsService {
	/**
	 * 🔍 Get User Info from Token (decode JWT)
	 */
	static getUserFromToken(token: string): {
		sub?: string;
		role?: string;
		exp?: number;
		iat?: number;
		fullName?: string;
		username?: string;
		email?: string;
		isModerator?: boolean;
	} | null {
		try {
			// Simple JWT decode (without verification for client-side)
			const base64Url = token.split('.')[1];
			const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
			const jsonPayload = decodeURIComponent(
				atob(base64)
					.split('')
					.map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
					.join(''),
			);

			return JSON.parse(jsonPayload);
		} catch (error) {
			console.error('Error decoding token:', error);
			return null;
		}
	}

	/**
	 * ⏰ Check if token is expired
	 */
	static isTokenExpired(token: string): boolean {
		try {
			const decoded = this.getUserFromToken(token);
			if (!decoded?.exp) return true;

			// Check if token expires in next 5 minutes (buffer time)
			const expirationTime = decoded.exp * 1000; // Convert to milliseconds
			const now = Date.now();
			const fiveMinutes = 5 * 60 * 1000;

			return expirationTime - now < fiveMinutes;
		} catch {
			return true;
		}
	}

	/**
	 * 🕒 Get token expiration time in milliseconds
	 */
	static getTokenExpirationTime(token: string): number | null {
		try {
			const decoded = this.getUserFromToken(token);
			if (!decoded?.exp) return null;

			return decoded.exp * 1000; // Convert to milliseconds
		} catch {
			return null;
		}
	}

	/**
	 * ⏳ Get time remaining until token expires (in milliseconds)
	 */
	static getTimeUntilExpiration(token: string): number | null {
		try {
			const expirationTime = this.getTokenExpirationTime(token);
			if (!expirationTime) return null;

			const now = Date.now();
			const timeRemaining = expirationTime - now;

			return timeRemaining > 0 ? timeRemaining : 0;
		} catch {
			return null;
		}
	}
}
