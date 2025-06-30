import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

import { TokenManager } from '@/lib/utils/auth/token-manager';

/**
 * Enhanced Token Sync Hook
 * Syncs tokens from NextAuth session to TokenManager with remember me support
 * This ensures client-side TokenManager has access to tokens stored in session
 */
export function useTokenSync() {
	const { data: session, status } = useSession();

	useEffect(() => {
		if (session?.accessToken && session?.refreshToken) {
			// SYNC: Tokens from session to TokenManager with remember me preference
			const rememberMe = session.rememberMe ?? false;
			TokenManager.setTokens(
				session.accessToken,
				session.refreshToken,
				rememberMe,
			);
		} else if (status === 'unauthenticated' || !session) {
			// CLEAR: Remove tokens when session is null or unauthenticated
			TokenManager.clearTokens();
		}
	}, [session, status]);

	// Return more detailed sync status
	return {
		hasTokens: !!(session?.accessToken && session?.refreshToken),
		sessionStatus: session ? 'authenticated' : 'unauthenticated',
		rememberMe: session?.rememberMe ?? false,
		tokenSyncStatus: TokenManager.getStorageInfo(),
	};
}
