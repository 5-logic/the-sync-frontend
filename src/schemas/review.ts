import { z } from 'zod';

import { UserSchema } from '@/schemas/user';

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

// Assignment Review schemas - liên quan đến review
export const AssignmentReviewSchema = z.object({
	reviewerId: z.string().uuid(),
	submissionId: z.string().uuid(),
});

// Reviewer schema - người thực hiện review
export const ReviewerSchema = z.object({
	id: z.string().uuid(),
	user: UserSchema,
});

// Assignment Review Detail schema với populated reviewer
export const AssignmentReviewDetailSchema = z.object({
	reviewerId: z.string().uuid(),
	submissionId: z.string().uuid(),
	reviewer: ReviewerSchema,
});

export const ReviewCreateSchema = ReviewSchema.omit({ id: true });
export const ReviewUpdateSchema = ReviewSchema.pick({ feedback: true });
export const ReviewItemCreateSchema = ReviewItemSchema;
export const ReviewItemUpdateSchema = ReviewItemSchema.pick({ note: true });

// Export inferred types - chỉ những type liên quan đến review
export type Review = z.infer<typeof ReviewSchema>;
export type ReviewCreate = z.infer<typeof ReviewCreateSchema>;
export type ReviewUpdate = z.infer<typeof ReviewUpdateSchema>;
export type ReviewItem = z.infer<typeof ReviewItemSchema>;
export type ReviewItemCreate = z.infer<typeof ReviewItemCreateSchema>;
export type ReviewItemUpdate = z.infer<typeof ReviewItemUpdateSchema>;
export type AssignmentReview = z.infer<typeof AssignmentReviewSchema>;
export type Reviewer = z.infer<typeof ReviewerSchema>;
export type AssignmentReviewDetail = z.infer<
	typeof AssignmentReviewDetailSchema
>;
