import { z } from 'zod';

export const ReviewSchema = z.object({
	id: z.string().uuid(),
	feedback: z.string().optional(),
	lecturerId: z.string().uuid(),
	checklistId: z.string().uuid(),
	submissionId: z.string().uuid(),
});

export const ReviewItemSchema = z.object({
	reviewId: z.string().uuid(),
	checklistItemId: z.string().uuid(),
	note: z.string().optional(),
});

export const ReviewCreateSchema = ReviewSchema.omit({ id: true });
export const ReviewUpdateSchema = ReviewSchema.pick({ feedback: true });
export const ReviewItemCreateSchema = ReviewItemSchema;
export const ReviewItemUpdateSchema = ReviewItemSchema.pick({ note: true });

// Export inferred types
export type Review = z.infer<typeof ReviewSchema>;
export type ReviewCreate = z.infer<typeof ReviewCreateSchema>;
export type ReviewUpdate = z.infer<typeof ReviewUpdateSchema>;
export type ReviewItem = z.infer<typeof ReviewItemSchema>;
export type ReviewItemCreate = z.infer<typeof ReviewItemCreateSchema>;
export type ReviewItemUpdate = z.infer<typeof ReviewItemUpdateSchema>;
