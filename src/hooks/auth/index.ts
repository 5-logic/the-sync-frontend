// Authentication Hooks - Centralized Exports

// Core auth hooks
export * from '@/hooks/auth/useAuth';
export * from '@/hooks/auth/usePermissions';
export * from '@/hooks/auth/useTokenStatus';
export * from '@/hooks/auth/useTokenSync';

// Re-export commonly used hooks with convenient names
export { useAuthGuard as useAuth } from '@/hooks/auth/useAuth';
export {
	useStudentAuth,
	useLecturerAuth,
	useAdminAuth,
	useModeratorAuth,
} from '@/hooks/auth/useAuth';
