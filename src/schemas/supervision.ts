import { z } from 'zod';

// Base supervision schemas
export const SupervisionStatusSchema = z.enum(['Active', 'Inactive']);

export const LecturerInfoSchema = z.object({
	id: z.string().uuid(),
	fullName: z.string(),
	email: z.string().email(),
});

export const SupervisionSchema = z.object({
	id: z.string().uuid(),
	lecturer: LecturerInfoSchema,
	status: SupervisionStatusSchema,
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
});

// Simple supervision schema for API responses
export const SimpleSupervisionSchema = z.object({
	lecturerId: z.string().uuid(),
});

export const SupervisorInfoSchema = z.object({
	id: z.string().uuid(),
	fullName: z.string(),
});

// Supervision assignment/change related schemas
export const AssignSupervisorSchema = z.object({
	thesisId: z.string().uuid(),
	lecturerId: z.string().uuid(),
});

// Request schemas for API calls
export const AssignSupervisorRequestSchema = z.object({
	lecturerId: z.string().uuid(),
});

export const ChangeSupervisorRequestSchema = z.object({
	currentSupervisorId: z.string().uuid(),
	newSupervisorId: z.string().uuid(),
});

export const ChangeSupervisorSchema = z.object({
	thesisId: z.string().uuid(),
	currentLecturerId: z.string().uuid(),
	newLecturerId: z.string().uuid(),
});

export const RemoveSupervisorSchema = z.object({
	thesisId: z.string().uuid(),
	lecturerId: z.string().uuid(),
});

// Bulk assignment schemas
export const BulkAssignmentItemSchema = z.object({
	thesisId: z.string().uuid(),
	lecturerIds: z.array(z.string().uuid()),
});

export const BulkAssignmentRequestSchema = z.object({
	assignments: z.array(BulkAssignmentItemSchema),
});

export const BulkAssignmentResultSchema = z.object({
	thesisId: z.string().uuid(),
	lecturerId: z.string().uuid(),
	status: z.enum([
		'success',
		'already_exists',
		'max_supervisors_reached',
		'error',
	]),
	message: z.string().optional(),
});

export const BulkAssignmentApiResponseSchema = z.array(
	BulkAssignmentResultSchema,
);

export const BulkAssignmentResponseSchema = z.object({
	results: z.array(
		BulkAssignmentResultSchema.extend({
			success: z.boolean().optional(),
		}),
	),
	summary: z.object({
		total: z.number(),
		successful: z.number(),
		failed: z.number(),
	}),
});

// Supervisor assignment data for UI components
export const SupervisorAssignmentDataSchema = z.object({
	id: z.string().uuid(),
	thesisId: z.string().uuid(),
	groupName: z.string(),
	thesisTitle: z.string(),
	memberCount: z.number().optional(),
	supervisors: z.array(z.string()),
	supervisorDetails: z.array(SupervisorInfoSchema),
	status: z.enum(['Finalized', 'Incomplete', 'Unassigned']),
});

// Extended schemas for complex operations
export const ThesisSupervisionSchema = z.object({
	thesisId: z.string().uuid(),
	thesisTitle: z.string(),
	supervisions: z.array(SupervisionSchema),
	group: z
		.object({
			id: z.string().uuid(),
			name: z.string(),
			memberCount: z.number(),
		})
		.nullable(),
});

// Export inferred types
export type SupervisionStatus = z.infer<typeof SupervisionStatusSchema>;
export type LecturerInfo = z.infer<typeof LecturerInfoSchema>;
export type Supervision = z.infer<typeof SupervisionSchema>;
export type SimpleSupervision = z.infer<typeof SimpleSupervisionSchema>;
export type SupervisorInfo = z.infer<typeof SupervisorInfoSchema>;
export type AssignSupervisor = z.infer<typeof AssignSupervisorSchema>;
export type AssignSupervisorRequest = z.infer<
	typeof AssignSupervisorRequestSchema
>;
export type ChangeSupervisorRequest = z.infer<
	typeof ChangeSupervisorRequestSchema
>;
export type ChangeSupervisor = z.infer<typeof ChangeSupervisorSchema>;
export type RemoveSupervisor = z.infer<typeof RemoveSupervisorSchema>;
export type BulkAssignmentItem = z.infer<typeof BulkAssignmentItemSchema>;
export type BulkAssignmentRequest = z.infer<typeof BulkAssignmentRequestSchema>;
export type BulkAssignmentResult = z.infer<typeof BulkAssignmentResultSchema>;
export type BulkAssignmentApiResponse = z.infer<
	typeof BulkAssignmentApiResponseSchema
>;
export type BulkAssignmentResponse = z.infer<
	typeof BulkAssignmentResponseSchema
>;
export type SupervisorAssignmentData = z.infer<
	typeof SupervisorAssignmentDataSchema
>;
export type ThesisSupervision = z.infer<typeof ThesisSupervisionSchema>;
