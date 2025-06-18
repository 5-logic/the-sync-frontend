import { z } from 'zod';

import { ChecklistReviewAcceptanceSchema } from '@/schemas/_enums';

export const ChecklistSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1),
	description: z.string().nullable().optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const ChecklistItemSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1),
	acceptance: ChecklistReviewAcceptanceSchema.default('NotAvailable'),
	description: z.string().nullable().optional(),
	isRequired: z.boolean().default(false),
	checklistId: z.string().uuid(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const ChecklistCreateSchema = ChecklistSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});

export const ChecklistUpdateSchema = ChecklistSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
}).partial();

export const ChecklistItemCreateSchema = ChecklistItemSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
}).extend({
	acceptance: ChecklistReviewAcceptanceSchema.optional(),
	isRequired: z.boolean().optional(),
});

export const ChecklistItemUpdateSchema = ChecklistItemSchema.omit({
	id: true,
	checklistId: true,
	createdAt: true,
	updatedAt: true,
}).partial();

// Export inferred types
export type Checklist = z.infer<typeof ChecklistSchema>;
export type ChecklistCreate = z.infer<typeof ChecklistCreateSchema>;
export type ChecklistUpdate = z.infer<typeof ChecklistUpdateSchema>;
export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;
export type ChecklistItemCreate = z.infer<typeof ChecklistItemCreateSchema>;
export type ChecklistItemUpdate = z.infer<typeof ChecklistItemUpdateSchema>;
