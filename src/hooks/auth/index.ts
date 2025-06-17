// Auth hooks - centralized exports
export * from './useAuth';
export * from './usePermissions';
export * from './useTokenStatus';
export * from './useTokenSync';

// Re-export commonly used hooks with shorter names
export { useAuthGuard as useAuth } from './useAuth';
export { useTokenStatus } from './useTokenStatus';
export { usePermissions } from './usePermissions';
