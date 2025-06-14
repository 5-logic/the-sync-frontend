import { z } from 'zod';

export const StudentGroupParticipationSchema = z.object({
	studentId: z.string(),
	groupId: z.string().uuid(),
	semesterId: z.string().uuid(),
	isLeader: z.boolean().default(false),
});

export const SupervisionSchema = z.object({
	lecturerId: z.string().uuid(),
	thesisId: z.string().uuid(),
});

export const ParticipationCreateSchema = StudentGroupParticipationSchema.extend(
	{
		isLeader: z.boolean().optional(),
	},
);

export const ParticipationUpdateSchema = StudentGroupParticipationSchema.pick({
	isLeader: true,
});

export const SupervisionCreateSchema = SupervisionSchema;

// Export inferred types
export type StudentGroupParticipation = z.infer<
	typeof StudentGroupParticipationSchema
>;
export type ParticipationCreate = z.infer<typeof ParticipationCreateSchema>;
export type ParticipationUpdate = z.infer<typeof ParticipationUpdateSchema>;
export type Supervision = z.infer<typeof SupervisionSchema>;
export type SupervisionCreate = z.infer<typeof SupervisionCreateSchema>;
