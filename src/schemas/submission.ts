import { z } from 'zod';

import { SubmissionStatusSchema } from '@/schemas/_enums';
import { AssignmentReviewDetailSchema } from '@/schemas/review';

export const SubmissionSchema = z.object({
	id: z.string().uuid(),
	groupId: z.string().uuid(),
	milestoneId: z.string().uuid(),
	createdAt: z.date(),
	updatedAt: z.date(),
	documents: z.array(z.string()),
	status: SubmissionStatusSchema,
});

// Submission Detail schema với populated relations
export const SubmissionDetailSchema = z.object({
	id: z.string().uuid(),
	groupId: z.string().uuid(),
	milestoneId: z.string().uuid(),
	createdAt: z.date(),
	updatedAt: z.date(),
	documents: z.array(z.string()),
	status: SubmissionStatusSchema,
	// Populated relations - sử dụng inline schema để tránh circular dependency
	group: z.object({
		id: z.string().uuid(),
		code: z.string(),
		name: z.string(),
	}),
	milestone: z
		.object({
			id: z.string().uuid(),
			name: z.string(),
			startDate: z.date(),
			endDate: z.date(),
		})
		.optional(),
	assignmentReviews: z.array(AssignmentReviewDetailSchema).optional(),
});

export const SubmissionCreateSchema = SubmissionSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});

export const SubmissionUpdateSchema = SubmissionSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
}).partial({
	groupId: true,
	milestoneId: true,
});

// Export inferred types - chỉ những type liên quan đến submission
export type Submission = z.infer<typeof SubmissionSchema>;
export type SubmissionDetail = z.infer<typeof SubmissionDetailSchema>;
export type SubmissionCreate = z.infer<typeof SubmissionCreateSchema>;
export type SubmissionUpdate = z.infer<typeof SubmissionUpdateSchema>;
