import { useEffect, useState } from 'react';

import { TokenManager } from '@/lib/auth/token-manager';
import { AuthService } from '@/lib/services/auth';

interface TokenStatus {
	hasAccessToken: boolean;
	hasRefreshToken: boolean;
	isAccessTokenExpired: boolean;
	isRefreshTokenExpired: boolean;
	accessTokenExpiry: Date | null;
	refreshTokenExpiry: Date | null;
	timeUntilAccessExpiry: number | null;
	timeUntilRefreshExpiry: number | null;
}

export function useTokenStatus() {
	const [tokenStatus, setTokenStatus] = useState<TokenStatus>({
		hasAccessToken: false,
		hasRefreshToken: false,
		isAccessTokenExpired: false,
		isRefreshTokenExpired: false,
		accessTokenExpiry: null,
		refreshTokenExpiry: null,
		timeUntilAccessExpiry: null,
		timeUntilRefreshExpiry: null,
	});

	const updateTokenStatus = () => {
		const accessToken = TokenManager.getAccessToken();
		const refreshToken = TokenManager.getRefreshToken();

		let accessTokenInfo = null;
		let refreshTokenInfo = null;

		if (accessToken) {
			accessTokenInfo = AuthService.getUserFromToken(accessToken);
		}

		if (refreshToken) {
			refreshTokenInfo = AuthService.getUserFromToken(refreshToken);
		}

		const now = Date.now();

		const accessTokenExpiry = accessTokenInfo?.exp
			? new Date(accessTokenInfo.exp * 1000)
			: null;
		const refreshTokenExpiry = refreshTokenInfo?.exp
			? new Date(refreshTokenInfo.exp * 1000)
			: null;

		const timeUntilAccessExpiry = accessTokenExpiry
			? accessTokenExpiry.getTime() - now
			: null;
		const timeUntilRefreshExpiry = refreshTokenExpiry
			? refreshTokenExpiry.getTime() - now
			: null;

		setTokenStatus({
			hasAccessToken: !!accessToken,
			hasRefreshToken: !!refreshToken,
			isAccessTokenExpired: accessToken
				? AuthService.isTokenExpired(accessToken)
				: false,
			isRefreshTokenExpired: refreshToken
				? AuthService.isTokenExpired(refreshToken)
				: false,
			accessTokenExpiry,
			refreshTokenExpiry,
			timeUntilAccessExpiry,
			timeUntilRefreshExpiry,
		});
	};

	useEffect(() => {
		updateTokenStatus();

		// Update every 30 seconds to track expiration
		const interval = setInterval(updateTokenStatus, 30000);

		return () => clearInterval(interval);
	}, []);

	return { tokenStatus, updateTokenStatus };
}

// Format time until expiry
export function formatTimeUntilExpiry(milliseconds: number | null): string {
	if (!milliseconds) return 'Unknown';

	if (milliseconds <= 0) return 'Expired';

	const minutes = Math.floor(milliseconds / (1000 * 60));
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
	if (hours > 0) return `${hours}h ${minutes % 60}m`;
	return `${minutes}m`;
}
