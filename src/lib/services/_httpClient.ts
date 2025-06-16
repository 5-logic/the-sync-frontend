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

// 👉 Interceptor để thêm token (nếu có)
httpClient.interceptors.request.use((config) => {
	// const token = localStorage.getItem('token');
	// if (token) {
	// 	config.headers.Authorization = `Bearer ${token}`;
	// }
	return config;
});

// 👉 Optional: Interceptor xử lý lỗi
httpClient.interceptors.response.use(
	(res) => res,
	(error) => {
		console.error('API Error:', error.response ?? error.message);
		return Promise.reject(error);
	},
);

export default httpClient;
