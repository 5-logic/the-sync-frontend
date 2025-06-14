import { z } from 'zod';

import { ChecklistReviewAcceptanceSchema } from '@/schemas/_enums';

export const ChecklistSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1).max(100),
	description: z.string().optional(),
	milestoneId: z.string().uuid(),
});

export const ChecklistItemSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1).max(100),
	acceptance: ChecklistReviewAcceptanceSchema.default('not_available'),
	description: z.string().optional(),
	isRequired: z.boolean().default(false),
	checklistId: z.string().uuid(),
});

export const ChecklistCreateSchema = ChecklistSchema.omit({ id: true });
export const ChecklistUpdateSchema = ChecklistSchema.omit({
	id: true,
}).partial();

export const ChecklistItemCreateSchema = ChecklistItemSchema.omit({
	id: true,
}).extend({
	acceptance: ChecklistReviewAcceptanceSchema.optional(),
	isRequired: z.boolean().optional(),
});
export const ChecklistItemUpdateSchema = ChecklistItemSchema.omit({
	id: true,
	checklistId: true,
}).partial();

// Export inferred types
export type Checklist = z.infer<typeof ChecklistSchema>;
export type ChecklistCreate = z.infer<typeof ChecklistCreateSchema>;
export type ChecklistUpdate = z.infer<typeof ChecklistUpdateSchema>;
export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;
export type ChecklistItemCreate = z.infer<typeof ChecklistItemCreateSchema>;
export type ChecklistItemUpdate = z.infer<typeof ChecklistItemUpdateSchema>;
