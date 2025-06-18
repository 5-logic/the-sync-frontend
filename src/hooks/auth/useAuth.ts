import type { Session } from 'next-auth';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { TokenManager } from '@/lib/utils/auth/token-manager';

interface UseAuthGuardOptions {
	allowedRoles?: string[];
	requireModerator?: boolean;
	redirectTo?: string;
}

interface AuthorizationParams {
	role: string;
	isModerator?: boolean;
	allowedRoles: string[];
	requireModerator: boolean;
}

// Helper function to check role and moderator permissions
function checkPermissions({
	role,
	isModerator,
	allowedRoles,
	requireModerator,
}: AuthorizationParams): boolean {
	// Check role permissions
	if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
		return false;
	}

	// Check moderator permissions
	if (requireModerator && !isModerator) {
		return false;
	}

	return true;
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

	// Handle user authorization and redirect logic
	const handleUserAuthorization = useCallback(
		(user: Session['user']) => {
			const { role, isModerator } = user;
			const hasPermissions = checkPermissions({
				role,
				isModerator,
				allowedRoles,
				requireModerator,
			});

			if (!hasPermissions) {
				setIsAuthorized(false);
				router.push(redirectTo);
				return;
			}

			setIsAuthorized(true);
		},
		[allowedRoles, requireModerator, redirectTo, router],
	);

	// Handle fast authentication path
	const handleFastAuth = useCallback(() => {
		if (hasValidTokens && status === 'authenticated' && session?.user) {
			handleUserAuthorization(session.user);
			return true;
		}
		return false;
	}, [hasValidTokens, status, session, handleUserAuthorization]);

	// Handle unauthenticated state
	const handleUnauthenticated = useCallback(() => {
		TokenManager.clearTokens();
		setIsAuthorized(false);
		router.push('/login');
	}, [router]);

	// Handle authenticated state with token sync
	const handleAuthenticated = useCallback(() => {
		if (session?.user) {
			// Sync tokens from session
			if (session.accessToken && session.refreshToken) {
				TokenManager.setTokens(session.accessToken, session.refreshToken);
			}

			handleUserAuthorization(session.user);
		}
	}, [session, handleUserAuthorization]);

	// Main authorization effect
	useEffect(() => {
		// Fast path: If we have valid tokens and session, skip loading
		if (handleFastAuth()) {
			return;
		}

		// Handle different session states
		if (status === 'loading') {
			setIsAuthorized(null);
		} else if (status === 'unauthenticated') {
			handleUnauthenticated();
		} else if (status === 'authenticated') {
			handleAuthenticated();
		}
	}, [
		status,
		session,
		hasValidTokens,
		handleFastAuth,
		handleUnauthenticated,
		handleAuthenticated,
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
