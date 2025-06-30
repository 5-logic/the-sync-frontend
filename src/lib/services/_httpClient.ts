import axios from 'axios';

import { API_BASE_URL } from '@/lib/constants';
import { HttpInterceptors } from '@/lib/services/http/interceptors';

/**
 * Main HTTP Client for the application
 * Uses modular interceptors from ./http/interceptors.ts
 * This is the single source of truth for HTTP client configuration
 */
const httpClient = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		'Content-Type': 'application/json',
	},
	timeout: 3600000, // 1h timeout for backend API
});

// Apply improved interceptors from the dedicated interceptors module
httpClient.interceptors.request.use(
	HttpInterceptors.createRequestInterceptor(),
	HttpInterceptors.createRequestErrorHandler(),
);

httpClient.interceptors.response.use(
	HttpInterceptors.createResponseSuccessHandler(),
	HttpInterceptors.createResponseErrorHandler(httpClient),
);

export default httpClient;
