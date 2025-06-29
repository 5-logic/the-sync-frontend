import { Session } from 'next-auth';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { AUTH_MESSAGES } from '@/lib/auth/config/auth-constants';
import {
	checkRoutePermission,
	findMatchingRoute,
} from '@/lib/auth/guards/route-protection';
import { TokenManager } from '@/lib/utils/auth/token-manager';
import { AuthState } from '@/types/auth';

// Enhanced caching with TTL
interface CachedPermission {
	hasAccess: boolean;
	reason?: string;
	timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cache for route permissions to avoid repeated calculations
const permissionCache = new Map<string, CachedPermission>();

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
	// Cached permission checker with TTL
	const getPermissionCheck = useCallback(
		(
			route: ReturnType<typeof findMatchingRoute>,
			role?: string,
			isMod?: boolean,
		) => {
			const key = `${route?.path ?? 'none'}:${role}:${isMod}`;
			const cached = permissionCache.get(key);

			// Return cached result if still valid
			if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
				return { hasAccess: cached.hasAccess, reason: cached.reason };
			}

			// Compute new result
			let result: { hasAccess: boolean; reason?: string };
			if (!route) {
				result = { hasAccess: true, reason: undefined };
			} else {
				result = checkRoutePermission(route, role, isMod);
			}

			// Cache with timestamp
			permissionCache.set(key, {
				...result,
				timestamp: Date.now(),
			});

			return result;
		},
		[],
	); // Smart token check with remember me support
	const [hasValidTokens, setHasValidTokens] = useState(false);

	useEffect(() => {
		const checkTokens = () => {
			// Use TokenManager fast token validation first
			const fastToken = TokenManager.getFastAccessToken();
			if (fastToken) {
				setHasValidTokens(true);
				return;
			}

			// Quick check for token existence with storage info
			const storageInfo = TokenManager.getStorageInfo();
			setHasValidTokens(storageInfo.hasTokens && storageInfo.tokenValid);
		};

		checkTokens();
	}, [session]);

	// Handle fast authentication path
	const handleFastAuth = useCallback(() => {
		if (hasValidTokens && status === 'authenticated' && session?.user) {
			const matchedRoute = getMatchedRoute(pathname);
			const permissionCheck = getPermissionCheck(
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
				return true;
			}

			setAuthState({
				isAuthorized: true,
				isLoading: false,
			});
			return true;
		}
		return false;
	}, [
		hasValidTokens,
		status,
		session,
		pathname,
		getMatchedRoute,
		getPermissionCheck,
		userRole,
		isModerator,
		router,
	]);

	// Handle cached permission check
	const handleCachedPermission = useCallback(() => {
		if (
			permissionCache.has(cacheKey) &&
			status === 'authenticated' &&
			session
		) {
			const cachedResult = permissionCache.get(cacheKey)!;
			if (Date.now() - cachedResult.timestamp < CACHE_TTL) {
				setAuthState({
					isAuthorized: cachedResult.hasAccess,
					isLoading: false,
					error: cachedResult.reason,
				});
				return true;
			}
		}
		return false;
	}, [cacheKey, status, session]);

	// Handle unauthenticated state with smart cleanup
	const handleUnauthenticated = useCallback(() => {
		// Check if this was a remember me session
		const storageInfo = TokenManager.getStorageInfo();
		if (storageInfo.rememberMe) {
			console.log('Remember Me session expired, clearing persistent storage');
		}

		TokenManager.clearTokens();
		// Redirect to actual login page instead of NextAuth signin API
		router.push('/login');
		setAuthState({
			isAuthorized: false,
			isLoading: false,
			error: AUTH_MESSAGES.ERROR.AUTH_REQUIRED,
		});
	}, [router]);

	// ENHANCED: Handle authenticated state with smart token sync
	const handleAuthenticated = useCallback(() => {
		if (status === 'authenticated' && session?.user) {
			// Sync tokens from session to TokenManager
			if (session.accessToken && session.refreshToken) {
				const rememberMe = session.rememberMe ?? false;
				TokenManager.setTokens(
					session.accessToken,
					session.refreshToken,
					rememberMe,
				);
			}

			// Use cached route finding
			const matchedRoute = getMatchedRoute(pathname);
			// Use cached permission checking
			const permissionCheck = getPermissionCheck(
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
		}
	}, [
		status,
		session,
		getMatchedRoute,
		pathname,
		getPermissionCheck,
		userRole,
		isModerator,
		router,
	]);

	useEffect(() => {
		// Fast path: Use cached tokens if available
		if (handleFastAuth()) {
			return;
		}

		// Fast path: if we have cached result and user/route hasn't changed, use it
		if (handleCachedPermission()) {
			return;
		}

		// Reset state when checking
		setAuthState((prev: AuthState) => ({
			...prev,
			isLoading: true,
			error: undefined,
		}));

		// Handle different session states
		if (status === 'loading') {
			setAuthState({
				isAuthorized: null,
				isLoading: true,
			});
		} else if (status === 'unauthenticated') {
			handleUnauthenticated();
		} else {
			handleAuthenticated();
		}
	}, [
		handleFastAuth,
		handleCachedPermission,
		status,
		handleUnauthenticated,
		handleAuthenticated,
	]);

	return authState;
}
