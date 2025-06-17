import { Session } from 'next-auth';

import { USER_ROLES, UserRole } from '@/lib/auth/config/auth-constants';

export interface UserPermissions {
	role: UserRole;
	isModerator: boolean;
	canAccessStudentPages: boolean;
	canAccessLecturerPages: boolean;
	canAccessAdminPages: boolean;
	canAccessModeratorFeatures: boolean;
}

export function getUserPermissions(
	session: Session | null,
): UserPermissions | null {
	if (!session?.user?.role) {
		return null;
	}

	const role = session.user.role as UserRole;
	const isModerator = session.user.isModerator ?? false;
	return {
		role,
		isModerator,
		canAccessStudentPages: role === USER_ROLES.STUDENT,
		canAccessLecturerPages:
			role === USER_ROLES.LECTURER || role === USER_ROLES.MODERATOR,
		canAccessAdminPages: role === USER_ROLES.ADMIN,
		canAccessModeratorFeatures:
			(role === USER_ROLES.LECTURER && isModerator) ||
			role === USER_ROLES.MODERATOR,
	};
}

export function hasRequiredRole(
	userRole: UserRole | undefined,
	requiredRole: UserRole,
): boolean {
	// Exact role match
	if (userRole === requiredRole) {
		return true;
	}

	// Moderator can access lecturer routes
	if (
		userRole === USER_ROLES.MODERATOR &&
		requiredRole === USER_ROLES.LECTURER
	) {
		return true;
	}

	return false;
}

export function hasModeratorAccess(
	userRole: UserRole | undefined,
	isModerator: boolean | undefined,
): boolean {
	// Direct moderator role
	if (userRole === USER_ROLES.MODERATOR) {
		return true;
	}

	// Lecturer with moderator flag
	return userRole === USER_ROLES.LECTURER && Boolean(isModerator);
}

export function canAccessRoute(
	userRole: UserRole | undefined,
	isModerator: boolean | undefined,
	requiredRole: UserRole,
	requiresModerator?: boolean,
): { hasAccess: boolean; reason?: string } {
	// Check basic role permission
	if (!hasRequiredRole(userRole, requiredRole)) {
		return {
			hasAccess: false,
			reason: `Required role: ${requiredRole}, User role: ${userRole ?? 'undefined'}`,
		};
	}

	// Check moderator permission if required
	if (requiresModerator && !hasModeratorAccess(userRole, isModerator)) {
		return {
			hasAccess: false,
			reason: 'Moderator privileges required',
		};
	}

	return { hasAccess: true };
}
