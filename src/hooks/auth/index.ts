// Auth hooks - centralized exports
export * from '@/hooks/auth/useAuth';
export * from '@/hooks/auth/usePermissions';
export * from '@/hooks/auth/useTokenStatus';
export * from '@/hooks/auth/useTokenSync';

// Re-export commonly used hooks with shorter names
export { useAuthGuard as useAuth } from '@/hooks/auth/useAuth';
export { useTokenStatus } from '@/hooks/auth/useTokenStatus';
export { usePermissions } from '@/hooks/auth/usePermissions';
