import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
	const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null); // ✅ Track authorization state

	useEffect(() => {
		if (status === 'loading') {
			setIsAuthorized(null); // Still checking
			return;
		}
		// Not authenticated → login
		if (status === 'unauthenticated') {
			setIsAuthorized(false);
			router.push('/login');
			return;
		}

		// Check permissions if user is authenticated
		if (status === 'authenticated' && session?.user) {
			const { role, isModerator } = session.user; // Check role permissions
			if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
				setIsAuthorized(false);
				router.push(redirectTo);
				return;
			} // Check moderator permissions
			if (requireModerator && !isModerator) {
				setIsAuthorized(false);
				router.push(redirectTo);
				return;
			}

			setIsAuthorized(true); // ✅ Authorized
		}
	}, [status, session, router, allowedRoles, requireModerator, redirectTo]);

	return {
		session,
		status,
		loading: status === 'loading' || isAuthorized === null, // ✅ Loading until authorization is determined
		isAuthenticated: status === 'authenticated',
		isAuthorized, // ✅ Explicit authorization state
		user: session?.user || null,
	};
}

// Convenience hooks for specific roles
export const useStudentAuth = () => useAuthGuard({ allowedRoles: ['student'] });
export const useLecturerAuth = () =>
	useAuthGuard({ allowedRoles: ['lecturer'] });
export const useAdminAuth = () => useAuthGuard({ allowedRoles: ['admin'] });
export const useModeratorAuth = () =>
	useAuthGuard({ allowedRoles: ['lecturer'], requireModerator: true });
