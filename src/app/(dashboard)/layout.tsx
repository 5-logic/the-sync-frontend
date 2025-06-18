'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { useNavigationContext } from '@/components/common/NavigationLoader';
import { FullPageLoader } from '@/components/common/loading';
import { AUTH_MESSAGES } from '@/lib/auth/config/auth-constants';
import { useRouteProtection } from '@/lib/utils/auth/auth-helpers';

export default function DashboardLayout({
	children,
}: {
	readonly children: React.ReactNode;
}) {
	const { data: session, status } = useSession();
	const pathname = usePathname();
	const navigationContext = useNavigationContext();
	const { isAuthorized, isLoading, error } = useRouteProtection(
		pathname,
		session,
		status,
	);

	// Track if this is initial load vs navigation
	const [isInitialLoad, setIsInitialLoad] = useState(true);
	const previousPathnameRef = useRef(pathname);

	useEffect(() => {
		// After first successful load, subsequent changes are navigations
		if (isAuthorized === true && isInitialLoad) {
			setIsInitialLoad(false);
		}

		// Detect route changes
		if (previousPathnameRef.current !== pathname) {
			previousPathnameRef.current = pathname;
		}
	}, [pathname, isAuthorized, isInitialLoad]);

	// Fast path: If user is already authenticated and authorized,
	// and this is a navigation (not initial load), don't show auth loading
	const shouldShowAuthLoading =
		isInitialLoad ||
		(status === 'loading' && !session) ||
		(isLoading && !navigationContext?.isNavigating);

	// Show loading while checking authentication or redirecting
	// isAuthorized === null means authorization check is still in progress
	if (
		shouldShowAuthLoading &&
		(isLoading || status === 'loading' || isAuthorized === null)
	) {
		return (
			<FullPageLoader
				message={AUTH_MESSAGES.LOADING.VERIFYING}
				description={AUTH_MESSAGES.LOADING.VERIFYING_DESC}
			/>
		);
	}

	// Show loading while redirecting (unauthorized or unauthenticated)
	if (status === 'unauthenticated' || !isAuthorized) {
		return (
			<FullPageLoader
				message={AUTH_MESSAGES.LOADING.REDIRECTING}
				description={error ?? AUTH_MESSAGES.LOADING.REDIRECTING_DESC}
			/>
		);
	}

	// Return children directly - let role-specific layouts handle the UI
	return <>{children}</>;
}
