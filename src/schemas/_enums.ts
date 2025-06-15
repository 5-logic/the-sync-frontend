import { z } from 'zod';

export const GenderSchema = z.enum(['male', 'female']);
export const ThesisStatusSchema = z.enum([
	'new',
	'pending',
	'approved',
	'rejected',
]);
export const SkillLevelSchema = z.enum([
	'beginner',
	'intermediate',
	'proficient',
	'advanced',
	'expert',
]);
export const RequestTypeSchema = z.enum(['invite', 'join']);
export const RequestStatusSchema = z.enum(['pending', 'approved', 'rejected']);
export const SemesterStatusSchema = z.enum([
	'not_yet',
	'preparing',
	'picking',
	'ongoing',
	'end',
]);
export const OngoingPhaseSchema = z.enum(['scope_adjustable', 'scope_locked']);
export const EnrollmentStatusSchema = z.enum([
	'not_yet',
	'failed',
	'ongoing',
	'passed',
]);
export const ChecklistReviewAcceptanceSchema = z.enum([
	'accepted',
	'rejected',
	'not_available',
]);

// Export inferred types
export type Gender = z.infer<typeof GenderSchema>;
export type ThesisStatus = z.infer<typeof ThesisStatusSchema>;
export type SkillLevel = z.infer<typeof SkillLevelSchema>;
export type RequestType = z.infer<typeof RequestTypeSchema>;
export type RequestStatus = z.infer<typeof RequestStatusSchema>;
export type SemesterStatus = z.infer<typeof SemesterStatusSchema>;
export type OngoingPhase = z.infer<typeof OngoingPhaseSchema>;
export type EnrollmentStatus = z.infer<typeof EnrollmentStatusSchema>;
export type ChecklistReviewAcceptance = z.infer<
	typeof ChecklistReviewAcceptanceSchema
>;
