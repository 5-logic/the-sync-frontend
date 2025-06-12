import { Session } from 'next-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AUTH_MESSAGES } from './auth-constants';
import { checkRoutePermission, findMatchingRoute } from './route-protection';

export interface AuthState {
	isAuthorized: boolean | null;
	isLoading: boolean;
	error?: string;
}

export function useRouteProtection(
	pathname: string,
	session: Session | null,
	status: 'loading' | 'authenticated' | 'unauthenticated',
): AuthState {
	const router = useRouter();
	const [authState, setAuthState] = useState<AuthState>({
		isAuthorized: null,
		isLoading: true,
	});

	useEffect(() => {
		// Reset state when checking
		setAuthState((prev) => ({ ...prev, isLoading: true, error: undefined }));

		// Still loading session
		if (status === 'loading') {
			setAuthState({
				isAuthorized: null,
				isLoading: true,
			});
			return;
		}
		// Not authenticated - redirect to login
		if (status === 'unauthenticated') {
			router.push('/api/auth/signin');
			setAuthState({
				isAuthorized: false,
				isLoading: false,
				error: AUTH_MESSAGES.ERROR.AUTH_REQUIRED,
			});
			return;
		}

		// Find matching route
		const matchedRoute = findMatchingRoute(pathname);

		// Unknown route - allow access (fallback)
		if (!matchedRoute) {
			setAuthState({
				isAuthorized: true,
				isLoading: false,
			});
			return;
		}

		// Check permissions
		const userRole = session?.user?.role;
		const isModerator = session?.user?.isModerator;
		const permissionCheck = checkRoutePermission(
			matchedRoute,
			userRole,
			isModerator,
		);

		if (!permissionCheck.hasAccess) {
			router.push('/unauthorized');
			setAuthState({
				isAuthorized: false,
				isLoading: false,
				error: permissionCheck.reason,
			});
			return;
		}

		// All checks passed
		setAuthState({
			isAuthorized: true,
			isLoading: false,
		});
	}, [pathname, session, status, router]);

	return authState;
}
