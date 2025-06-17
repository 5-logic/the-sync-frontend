// lib/services/_httpClient.ts
import axios from 'axios';

import { API_BASE_URL } from '@/lib/constants';

const httpClient = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		'Content-Type': 'application/json',
	},
	// withCredentials: true, // Nếu dùng cookie-based auth
	timeout: 10000, // 10s timeout
});

export default httpClient;
