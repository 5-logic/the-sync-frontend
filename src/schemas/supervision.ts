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

export const SupervisorInfoSchema = z.object({
	id: z.string().uuid(),
	fullName: z.string(),
});

// Supervision assignment/change related schemas
export const AssignSupervisorSchema = z.object({
	thesisId: z.string().uuid(),
	lecturerId: z.string().uuid(),
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
export type SupervisorInfo = z.infer<typeof SupervisorInfoSchema>;
export type AssignSupervisor = z.infer<typeof AssignSupervisorSchema>;
export type ChangeSupervisor = z.infer<typeof ChangeSupervisorSchema>;
export type RemoveSupervisor = z.infer<typeof RemoveSupervisorSchema>;
export type SupervisorAssignmentData = z.infer<
	typeof SupervisorAssignmentDataSchema
>;
export type ThesisSupervision = z.infer<typeof ThesisSupervisionSchema>;
