import { useSession } from 'next-auth/react';

import {
	UserPermissions,
	getUserPermissions,
} from '@/lib/auth/guards/permissions';

export interface UsePermissionsReturn {
	permissions: UserPermissions | null;
	isLoading: boolean;
	canAccessStudentPages: boolean;
	canAccessLecturerPages: boolean;
	canAccessAdminPages: boolean;
	canAccessModeratorFeatures: boolean;
}

export function usePermissions(): UsePermissionsReturn {
	const { data: session, status } = useSession();

	const permissions = getUserPermissions(session);
	const isLoading = status === 'loading';

	return {
		permissions,
		isLoading,
		canAccessStudentPages: permissions?.canAccessStudentPages || false,
		canAccessLecturerPages: permissions?.canAccessLecturerPages || false,
		canAccessAdminPages: permissions?.canAccessAdminPages || false,
		canAccessModeratorFeatures:
			permissions?.canAccessModeratorFeatures || false,
	};
}
