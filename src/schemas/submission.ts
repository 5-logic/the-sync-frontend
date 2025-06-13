import { z } from 'zod';

export const SubmissionSchema = z.object({
	id: z.string().uuid(),
	groupId: z.string().uuid(),
	milestoneId: z.string().uuid(),
});

export const AssignmentReviewSchema = z.object({
	reviewerId: z.string().uuid(),
	submissionId: z.string().uuid(),
});

export const SubmissionCreateSchema = SubmissionSchema.omit({ id: true });

// Export inferred types
export type Submission = z.infer<typeof SubmissionSchema>;
export type SubmissionCreate = z.infer<typeof SubmissionCreateSchema>;
export type AssignmentReview = z.infer<typeof AssignmentReviewSchema>;
