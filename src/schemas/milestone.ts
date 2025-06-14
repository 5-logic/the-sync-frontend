import { z } from 'zod';

export const MilestoneSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1).max(100),
	startDate: z.date(),
	endDate: z.date(),
	semesterId: z.string().uuid(),
	checklistId: z.string().uuid().optional(),
});

export const MilestoneCreateSchema = MilestoneSchema.omit({ id: true });
export const MilestoneUpdateSchema = MilestoneSchema.omit({
	id: true,
}).partial();

// Export inferred types
export type Milestone = z.infer<typeof MilestoneSchema>;
export type MilestoneCreate = z.infer<typeof MilestoneCreateSchema>;
export type MilestoneUpdate = z.infer<typeof MilestoneUpdateSchema>;
