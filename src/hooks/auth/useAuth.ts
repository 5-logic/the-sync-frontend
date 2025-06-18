import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { TokenManager } from '@/lib/utils/auth/token-manager';

interface UseAuthGuardOptions {
	allowedRoles?: string[];
	requireModerator?: boolean;
	redirectTo?: string;
}

export function useAuthGuard({
	allowedRoles = [],
	requireModerator = false,
	redirectTo = '/unauthorized',
}: UseAuthGuardOptions = {}) {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
	const [hasValidTokens, setHasValidTokens] = useState(false);
	// Fast token check
	useEffect(() => {
		const checkTokens = async () => {
			// Use fast token validation first
			const fastToken = TokenManager.getFastAccessToken();
			if (fastToken) {
				setHasValidTokens(true);
				return;
			}

			// Fallback to full validation if fast check fails
			const accessToken = TokenManager.getAccessToken();
			const refreshToken = TokenManager.getRefreshToken();

			if (accessToken && refreshToken) {
				try {
					const validToken = await TokenManager.getValidAccessToken();
					setHasValidTokens(!!validToken);
				} catch {
					setHasValidTokens(false);
				}
			} else {
				setHasValidTokens(false);
			}
		};

		checkTokens();
	}, [session]);

	useEffect(() => {
		// Fast path: If we have valid tokens and session, skip loading
		if (hasValidTokens && status === 'authenticated' && session?.user) {
			const { role, isModerator } = session.user;

			// Check role permissions
			if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
				setIsAuthorized(false);
				router.push(redirectTo);
				return;
			}

			// Check moderator permissions
			if (requireModerator && !isModerator) {
				setIsAuthorized(false);
				router.push(redirectTo);
				return;
			}

			setIsAuthorized(true);
			return;
		}

		// Fallback to normal session check
		if (status === 'loading') {
			setIsAuthorized(null);
			return;
		}

		// Not authenticated → login
		if (status === 'unauthenticated') {
			TokenManager.clearTokens();
			setIsAuthorized(false);
			router.push('/login');
			return;
		}

		// Check permissions if user is authenticated
		if (status === 'authenticated' && session?.user) {
			// Sync tokens from session
			if (session.accessToken && session.refreshToken) {
				TokenManager.setTokens(session.accessToken, session.refreshToken);
			}

			const { role, isModerator } = session.user;

			// Check role permissions
			if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
				setIsAuthorized(false);
				router.push(redirectTo);
				return;
			}

			// Check moderator permissions
			if (requireModerator && !isModerator) {
				setIsAuthorized(false);
				router.push(redirectTo);
				return;
			}

			setIsAuthorized(true);
		}
	}, [
		status,
		session,
		router,
		allowedRoles,
		requireModerator,
		redirectTo,
		hasValidTokens,
	]);
	return {
		session,
		status,
		loading: status === 'loading' || isAuthorized === null,
		isAuthenticated: status === 'authenticated',
		isAuthorized,
		hasValidTokens,
		user: session?.user ?? null,
	};
}

// Convenience hooks for specific roles
export const useStudentAuth = () => useAuthGuard({ allowedRoles: ['student'] });
export const useLecturerAuth = () =>
	useAuthGuard({ allowedRoles: ['lecturer'] });
export const useAdminAuth = () => useAuthGuard({ allowedRoles: ['admin'] });
export const useModeratorAuth = () =>
	useAuthGuard({ allowedRoles: ['lecturer'], requireModerator: true });
