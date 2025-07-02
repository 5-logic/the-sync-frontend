import {
	AxiosError,
	AxiosInstance,
	AxiosResponse,
	InternalAxiosRequestConfig,
} from 'axios';

import { TokenManager } from '@/lib/utils/auth/token-manager';

/**
 * Extended request config to include retry flag
 */
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
	_retry?: boolean;
}
/**
 * Request and response interceptors with TokenManager and remember me support
 */
export class HttpInterceptors {
	/**
	 * Type guard to check if request has retry capability
	 */
	private static isRetryableRequest(
		config: InternalAxiosRequestConfig,
	): config is ExtendedAxiosRequestConfig {
		return typeof config === 'object' && config !== null;
	}
	/**
	 * Add access token with simple check (no automatic refresh)
	 * Only refresh when we get 401 error to reduce unnecessary backend calls
	 */
	static createRequestInterceptor() {
		return async (config: InternalAxiosRequestConfig) => {
			// Skip auth for login/refresh endpoints
			const authEndpoints = [
				'/auth/admin/login',
				'/auth/user/login',
				'/auth/admin/refresh',
				'/auth/user/refresh',
			];
			const isAuthEndpoint = authEndpoints.some((endpoint) =>
				config.url?.includes(endpoint),
			);

			// For auth endpoints, don't add any Authorization header
			if (isAuthEndpoint) {
				return config;
			}

			// For all other endpoints, just get current access token without refreshing
			// Let 401 handler deal with refresh to avoid unnecessary backend calls
			try {
				const accessToken = TokenManager.getAccessToken(); // ← CHANGED: No auto-refresh
				if (accessToken && TokenManager.isTokenValid(accessToken)) {
					config.headers = config.headers ?? {};
					config.headers.Authorization = `Bearer ${accessToken}`;
				}
			} catch {
				// Continue without token - API will handle 401
			}

			return config;
		};
	}
	/**
	 * Request Error Handler
	 */
	static createRequestErrorHandler() {
		return (error: AxiosError) => {
			console.error('Request Error:', error);
			// Ensure error is an Error instance
			const errorToReject =
				error instanceof Error ? error : new Error(String(error));
			return Promise.reject(errorToReject);
		};
	}

	/**
	 * Response Success Handler
	 */
	static createResponseSuccessHandler() {
		return (response: AxiosResponse) => response;
	}

	/**
	 * Check if request config is valid
	 */
	private static validateRequestConfig(
		error: AxiosError,
	): ExtendedAxiosRequestConfig | null {
		if (!error.config) {
			console.error(
				'API Error (no config):',
				error.response?.data ?? error.message,
			);
			return null;
		}

		if (!HttpInterceptors.isRetryableRequest(error.config)) {
			console.error('Invalid request config for retry');
			return null;
		}

		return error.config;
	}

	/**
	 * Check if the request is an authentication endpoint
	 */
	private static isAuthEndpoint(url?: string): boolean {
		if (!url) return false;

		const authEndpoints = [
			'/auth/admin/login',
			'/auth/user/login',
			'/auth/admin/refresh',
			'/auth/user/refresh',
		];

		return authEndpoints.some((endpoint) => url.includes(endpoint));
	}

	/**
	 * Handle token refresh and retry request
	 */
	private static async handleTokenRefresh(
		originalRequest: ExtendedAxiosRequestConfig,
		httpClient: AxiosInstance,
	): Promise<AxiosResponse> {
		console.log('🔄 Token expired, attempting refresh...');

		const newAccessToken = await TokenManager.refreshAccessToken();

		if (newAccessToken) {
			console.log('✅ Token refresh successful');
			originalRequest.headers = originalRequest.headers ?? {};
			originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
			return httpClient(originalRequest);
		}

		console.warn('❌ Token refresh failed, redirecting to login');
		TokenManager.clearTokens();

		if (typeof window !== 'undefined') {
			window.location.href = '/login';
		}

		throw new Error('Token refresh failed');
	}

	/**
	 * Log API errors for monitoring
	 */
	private static logApiError(
		error: AxiosError,
		originalRequest: ExtendedAxiosRequestConfig,
	): void {
		if (error.response?.status !== 401) {
			console.error('API Error:', {
				status: error.response?.status,
				url: originalRequest.url,
				message: error.response?.data ?? error.message,
			});
		}
	}

	/**
	 * Create standard error object
	 */
	private static createErrorObject(error: AxiosError): Error {
		return error instanceof Error ? error : new Error(String(error));
	}

	/**
	 * Smart token refresh with remember me support and controlled refresh frequency
	 */
	static createResponseErrorHandler(httpClient: AxiosInstance) {
		return async (error: AxiosError) => {
			const originalRequest = HttpInterceptors.validateRequestConfig(error);

			if (!originalRequest) {
				return Promise.reject(HttpInterceptors.createErrorObject(error));
			}

			const shouldRetryWithRefresh =
				error.response?.status === 401 &&
				!originalRequest._retry &&
				!HttpInterceptors.isAuthEndpoint(originalRequest.url);

			if (shouldRetryWithRefresh) {
				originalRequest._retry = true;

				try {
					return await HttpInterceptors.handleTokenRefresh(
						originalRequest,
						httpClient,
					);
				} catch {
					// Token refresh failed, fall through to rejection
				}
			}

			HttpInterceptors.logApiError(error, originalRequest);
			return Promise.reject(HttpInterceptors.createErrorObject(error));
		};
	}
}
