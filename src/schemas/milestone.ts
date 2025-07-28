import { z } from 'zod';

export const MilestoneSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1),
	startDate: z.date(),
	endDate: z.date(),
	semesterId: z.string().uuid(),
	checklistId: z.string().uuid().nullable().optional(),
	note: z.string().optional(),
	documents: z.array(z.string()).optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const MilestoneCreateSchema = MilestoneSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});

export const MilestoneUpdateSchema = MilestoneSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
}).partial();

// Export inferred types
export type Milestone = z.infer<typeof MilestoneSchema>;
export type MilestoneCreate = z.infer<typeof MilestoneCreateSchema>;
export type MilestoneUpdate = z.infer<typeof MilestoneUpdateSchema>;
