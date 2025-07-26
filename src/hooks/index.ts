// 🎣 Hooks - Centralized exports
// Export all hooks from their respective categories

// Auth-related hooks
export * from '@/hooks/auth';

// Lecturer-related hooks
export * from '@/hooks/lecturer/useAssignSupervisor';
export * from '@/hooks/lecturer/useSupervisedGroups';

// Semester-related hooks
export * from '@/hooks/semester';

// UI/Layout hooks
export * from '@/hooks/ui';

// UX/Navigation hooks
export * from '@/hooks/ux';

// Thesis hooks
export * from '@/hooks/thesis';

// Student-specific hooks
export { useStudentGroupStatus } from '@/hooks/student/useStudentGroupStatus';
export * from '@/hooks/student';
