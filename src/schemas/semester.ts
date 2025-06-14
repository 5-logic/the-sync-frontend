import { z } from 'zod';

import { OngoingPhaseSchema, SemesterStatusSchema } from '@/schemas/_enums';

export const SemesterSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1).max(100),
	code: z.string().min(1).max(20),
	maxGroup: z.number().int().positive().optional(),
	status: SemesterStatusSchema,
	ongoingPhase: OngoingPhaseSchema.optional(),
});

export const SemesterCreateSchema = SemesterSchema.omit({ id: true });
export const SemesterUpdateSchema = SemesterSchema.omit({ id: true }).partial();

// Export inferred types
export type Semester = z.infer<typeof SemesterSchema>;
export type SemesterCreate = z.infer<typeof SemesterCreateSchema>;
export type SemesterUpdate = z.infer<typeof SemesterUpdateSchema>;
