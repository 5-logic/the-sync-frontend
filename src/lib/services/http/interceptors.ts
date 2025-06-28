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
	 * Add access token with smart fallback
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
			); // For auth endpoints, don't add any Authorization header
			if (isAuthEndpoint) {
				return config;
			}

			// For all other endpoints, try to get a valid access token using TokenManager
			try {
				const accessToken = await TokenManager.getValidAccessToken();
				if (accessToken) {
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
	 * Smart token refresh with remember me support
	 */ static createResponseErrorHandler(httpClient: AxiosInstance) {
		return async (error: AxiosError) => {
			// Handle case where config might be undefined
			if (!error.config) {
				console.error(
					'API Error (no config):',
					error.response?.data ?? error.message,
				);
				const errorToReject =
					error instanceof Error ? error : new Error(String(error));
				return Promise.reject(errorToReject);
			}
			const originalRequest = error.config;

			// Ensure we can add retry flag to the request
			if (!HttpInterceptors.isRetryableRequest(originalRequest)) {
				console.error('Invalid request config for retry');
				const errorToReject =
					error instanceof Error ? error : new Error(String(error));
				return Promise.reject(errorToReject);
			}

			// Skip token refresh for auth endpoints (login/refresh)
			const authEndpoints = [
				'/auth/admin/login',
				'/auth/user/login',
				'/auth/admin/refresh',
				'/auth/user/refresh',
			];
			const isAuthEndpoint = authEndpoints.some((endpoint) =>
				originalRequest.url?.includes(endpoint),
			); // Handle 401 Unauthorized (token expired) - but NOT for auth endpoints
			if (
				error.response?.status === 401 &&
				!originalRequest._retry &&
				!isAuthEndpoint
			) {
				originalRequest._retry = true;

				// Use TokenManager for token refresh
				const newAccessToken = await TokenManager.refreshAccessToken();

				if (newAccessToken) {
					// SUCCESS: Retry original request with new token
					originalRequest.headers = originalRequest.headers ?? {};
					originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

					return httpClient(originalRequest);
				} else {
					// REFRESH FAILED: Clear tokens and redirect to login
					TokenManager.clearTokens();

					// Only redirect if we're in the browser
					if (typeof window !== 'undefined') {
						window.location.href = '/login';
					}
				}
			}

			// Log API errors for monitoring
			console.error('API Error:', {
				status: error.response?.status,
				url: originalRequest.url,
				message: error.response?.data ?? error.message,
			});

			// Ensure error is an Error instance
			const errorToReject =
				error instanceof Error ? error : new Error(String(error));
			return Promise.reject(errorToReject);
		};
	}
}
