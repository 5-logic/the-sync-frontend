import { z } from 'zod';

import { OngoingPhaseSchema, SemesterStatusSchema } from '@/schemas/_enums';

export const SemesterSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1),
	code: z.string().min(1),
	maxGroup: z.number().int().positive().nullable().optional(),
	status: SemesterStatusSchema.default('NotYet'),
	ongoingPhase: OngoingPhaseSchema.nullable().optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const SemesterCreateSchema = SemesterSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
}).extend({
	status: SemesterStatusSchema.default('NotYet'),
	maxGroup: z.number().int().positive().optional(),
	ongoingPhase: OngoingPhaseSchema.optional(),
});

export const SemesterUpdateSchema = SemesterSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
}).partial();

// Export inferred types
export type Semester = z.infer<typeof SemesterSchema>;
export type SemesterCreate = z.infer<typeof SemesterCreateSchema>;
export type SemesterUpdate = z.infer<typeof SemesterUpdateSchema>;
