// 🎣 Hooks - Centralized exports
// Export all hooks from their respective categories

// Auth-related hooks
export * from "@/hooks/auth";

// Admin-related hooks
export * from "@/hooks/admin/useCreateGroups";
export * from "@/hooks/admin/useGroupManagement";
export * from "@/hooks/admin/useFormatGroups";

// Group-related hooks (shared between roles)
export * from "@/hooks/group";

// Lecturer-related hooks
export * from "@/hooks/lecturer/useAssignSupervisor";
export * from "@/hooks/lecturer/useSupervisedGroups";
export * from "@/hooks/lecturer/useLecturerSemesterFilter";
export * from "@/hooks/lecturer/useMilestonesSemesterFilter";

// Semester-related hooks
export * from "@/hooks/semester";

// UI/Layout hooks
export * from "@/hooks/ui";

// UX/Navigation hooks
export * from "@/hooks/ux";

// Thesis hooks
export * from "@/hooks/thesis";

// Student-specific hooks
export { useStudentGroupStatus } from "@/hooks/student/useStudentGroupStatus";
export * from "@/hooks/student";
