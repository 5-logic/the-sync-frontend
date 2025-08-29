/**
 * Cookie utility functions for authentication and storage management
 */
export class CookieUtils {
	/**
	 * Clear all cookies by setting them to expire in the past
	 * This function handles cross-domain and subdomain cookie clearing
	 */
	static clearAllCookies(): void {
		if (typeof document === 'undefined') return;

		// Get all cookies
		const cookies = document.cookie.split(';');

		// Clear each cookie by setting it to expire
		cookies.forEach((cookie) => {
			const eqPos = cookie.indexOf('=');
			const name =
				eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();

			// Set cookie to expire in the past
			document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
			document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;

			// Also try with subdomain
			const parts = window.location.hostname.split('.');
			if (parts.length > 2) {
				const domain = `.${parts.slice(-2).join('.')}`;
				document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`;
			}
		});
	}

	/**
	 * Clear a specific cookie by name
	 */
	static clearCookie(name: string): void {
		if (typeof document === 'undefined') return;

		// Set cookie to expire in the past
		document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
		document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;

		// Also try with subdomain
		const parts = window.location.hostname.split('.');
		if (parts.length > 2) {
			const domain = `.${parts.slice(-2).join('.')}`;
			document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`;
		}
	}

	/**
	 * Get a cookie value by name
	 */
	static getCookie(name: string): string | null {
		if (typeof document === 'undefined') return null;

		const value = `; ${document.cookie}`;
		const parts = value.split(`; ${name}=`);
		if (parts.length === 2) {
			const cookieValue = parts.pop()?.split(';').shift();
			return cookieValue || null;
		}
		return null;
	}

	/**
	 * Set a cookie with options
	 */
	static setCookie(
		name: string,
		value: string,
		options: {
			expires?: Date;
			maxAge?: number;
			path?: string;
			domain?: string;
			secure?: boolean;
			sameSite?: 'strict' | 'lax' | 'none';
		} = {},
	): void {
		if (typeof document === 'undefined') return;

		let cookieString = `${name}=${value}`;

		if (options.expires) {
			cookieString += `; expires=${options.expires.toUTCString()}`;
		}

		if (options.maxAge) {
			cookieString += `; max-age=${options.maxAge}`;
		}

		if (options.path) {
			cookieString += `; path=${options.path}`;
		}

		if (options.domain) {
			cookieString += `; domain=${options.domain}`;
		}

		if (options.secure) {
			cookieString += '; secure';
		}

		if (options.sameSite) {
			cookieString += `; samesite=${options.sameSite}`;
		}

		document.cookie = cookieString;
	}
}
