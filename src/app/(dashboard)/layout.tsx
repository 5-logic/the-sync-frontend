'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

import Loading from '@/components/common/Loading';
import DashboardLayoutComponent from '@/components/layout/DashboardLayout';
import { AUTH_MESSAGES } from '@/lib/auth/auth-constants';
import { useRouteProtection } from '@/lib/auth/auth-helpers';

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { data: session, status } = useSession();
	const pathname = usePathname();

	const { isAuthorized, isLoading, error } = useRouteProtection(
		pathname,
		session,
		status,
	);
	// Show loading while checking authentication or redirecting
	// isAuthorized === null means authorization check is still in progress
	if (isLoading || status === 'loading' || isAuthorized === null) {
		return (
			<Loading
				message={AUTH_MESSAGES.LOADING.VERIFYING}
				description={AUTH_MESSAGES.LOADING.VERIFYING_DESC}
			/>
		);
	}

	// Show loading while redirecting (unauthorized or unauthenticated)
	if (status === 'unauthenticated' || !isAuthorized) {
		return (
			<Loading
				message={AUTH_MESSAGES.LOADING.REDIRECTING}
				description={error || AUTH_MESSAGES.LOADING.REDIRECTING_DESC}
			/>
		);
	}
	return <DashboardLayoutComponent>{children}</DashboardLayoutComponent>;
}
