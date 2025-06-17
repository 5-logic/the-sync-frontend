import { z } from 'zod';

export const GenderSchema = z.enum(['Male', 'Female']);
export const ThesisStatusSchema = z.enum([
	'New',
	'Pending',
	'Approved',
	'Rejected',
]);
export const SkillLevelSchema = z.enum([
	'Beginner',
	'Intermediate',
	'Proficient',
	'Advanced',
	'Expert',
]);
export const RequestTypeSchema = z.enum(['Invite', 'Join']);
export const RequestStatusSchema = z.enum(['Pending', 'Approved', 'Rejected']);
export const SemesterStatusSchema = z.enum([
	'NotYet',
	'Preparing',
	'Picking',
	'Ongoing',
	'End',
]);
export const OngoingPhaseSchema = z.enum(['ScopeAdjustable', 'ScopeLocked']);
export const EnrollmentStatusSchema = z.enum([
	'NotYet',
	'Failed',
	'Ongoing',
	'Passed',
]);
export const ChecklistReviewAcceptanceSchema = z.enum([
	'Yes',
	'No',
	'NotAvailable',
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
