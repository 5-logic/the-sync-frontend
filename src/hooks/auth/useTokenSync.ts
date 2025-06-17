import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

import { TokenManager } from '@/lib/auth/token-manager';

/**
 * Hook to sync tokens from NextAuth session to TokenManager
 * This ensures client-side TokenManager has access to tokens stored in session
 */
export function useTokenSync() {
	const { data: session } = useSession();

	useEffect(() => {
		if (session?.accessToken && session?.refreshToken) {
			// Sync tokens from session to TokenManager
			TokenManager.setTokens(session.accessToken, session.refreshToken);
			console.log('🔄 Tokens synced from session to TokenManager');
		} else if (!session) {
			// Clear tokens when session is null
			TokenManager.clearTokens();
			console.log('🧹 Tokens cleared from TokenManager');
		}
	}, [session]);

	return {
		hasTokens: !!(session?.accessToken && session?.refreshToken),
		sessionStatus: session ? 'authenticated' : 'unauthenticated',
	};
}
