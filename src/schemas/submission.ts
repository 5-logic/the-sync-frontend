import { z } from 'zod';

import { SubmissionStatusSchema } from '@/schemas/_enums';

export const SubmissionSchema = z.object({
	id: z.string().uuid(),
	groupId: z.string().uuid(),
	milestoneId: z.string().uuid(),
	createdAt: z.date(),
	updatedAt: z.date(),
	documents: z.array(z.string()),
	status: SubmissionStatusSchema,
});

export const AssignmentReviewSchema = z.object({
	reviewerId: z.string().uuid(),
	submissionId: z.string().uuid(),
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

// Export inferred types
export type Submission = z.infer<typeof SubmissionSchema>;
export type SubmissionCreate = z.infer<typeof SubmissionCreateSchema>;
export type SubmissionUpdate = z.infer<typeof SubmissionUpdateSchema>;
export type AssignmentReview = z.infer<typeof AssignmentReviewSchema>;
