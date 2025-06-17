import { Session } from 'next-auth';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { AUTH_MESSAGES } from './auth-constants';
import { checkRoutePermission, findMatchingRoute } from './route-protection';

export interface AuthState {
	isAuthorized: boolean | null;
	isLoading: boolean;
	error?: string;
}

// Cache for route permissions to avoid repeated calculations
const permissionCache = new Map<
	string,
	{ hasAccess: boolean; reason?: string }
>();

// Cache for route matching to avoid repeated regex operations
const routeMatchCache = new Map<string, ReturnType<typeof findMatchingRoute>>();

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

	// Memoize user role and moderator status to avoid repeated object access
	const userRole = useMemo(() => session?.user?.role, [session?.user?.role]);
	const isModerator = useMemo(
		() => session?.user?.isModerator,
		[session?.user?.isModerator],
	);

	// Memoize permission cache key to avoid repeated string concatenation
	const cacheKey = useMemo(
		() => `${pathname}:${userRole}:${isModerator}`,
		[pathname, userRole, isModerator],
	);

	// Cached route finder with memoization
	const getMatchedRoute = useCallback((path: string) => {
		if (routeMatchCache.has(path)) {
			return routeMatchCache.get(path);
		}
		const route = findMatchingRoute(path);
		routeMatchCache.set(path, route);
		return route;
	}, []);

	// Cached permission checker
	const getPermissionCheck = useCallback(
		(
			route: ReturnType<typeof findMatchingRoute>,
			role?: string,
			isMod?: boolean,
		) => {
			const key = `${route?.path || 'none'}:${role}:${isMod}`;
			if (permissionCache.has(key)) {
				return permissionCache.get(key)!;
			}
			if (!route) {
				const result = { hasAccess: true, reason: undefined };
				permissionCache.set(key, result);
				return result;
			}

			const result = checkRoutePermission(route, role, isMod);
			permissionCache.set(key, result);
			return result;
		},
		[],
	);
	useEffect(() => {
		// Fast path: if we have cached result and user/route hasn't changed, use it
		if (
			permissionCache.has(cacheKey) &&
			status === 'authenticated' &&
			session
		) {
			const cachedResult = permissionCache.get(cacheKey)!;
			setAuthState({
				isAuthorized: cachedResult.hasAccess,
				isLoading: false,
				error: cachedResult.reason,
			});
			return;
		}

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

		// Use cached route finding
		const matchedRoute = getMatchedRoute(pathname);

		// Use cached permission checking
		const permissionCheck = getPermissionCheck(
			matchedRoute,
			userRole,
			isModerator,
		);

		console.log('🔍 Route protection check (optimized):', {
			pathname,
			userRole,
			isModerator,
			matchedRoute,
			cached: permissionCache.has(cacheKey),
		});

		console.log('🎯 Permission check result:', permissionCheck);

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
	}, [
		pathname,
		session,
		status,
		router,
		userRole,
		isModerator,
		cacheKey,
		getMatchedRoute,
		getPermissionCheck,
	]);

	return authState;
}
