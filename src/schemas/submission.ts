import { z } from 'zod';

// Schema for User within reviewer
export const UserSchema = z.object({
	id: z.string().uuid(),
	fullName: z.string(),
});

// Schema for Semester within group
export const SemesterSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	code: z.string(),
	status: z.string(),
});

// Schema for Group within submission detail
export const GroupDetailSchema = z.object({
	id: z.string().uuid(),
	code: z.string(),
	name: z.string(),
	semester: SemesterSchema,
});

// Schema for Milestone within submission detail
export const MilestoneDetailSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	startDate: z.string(),
	endDate: z.string(),
});

// Schema for Reviewer
export const ReviewerSchema = z.object({
	user: UserSchema,
});

// Schema for Assignment Review
export const AssignmentReviewDetailSchema = z.object({
	reviewerId: z.string().uuid(),
	submissionId: z.string().uuid(),
	reviewer: ReviewerSchema,
});

// Schema for Submission Detail from API
export const SubmissionDetailSchema = z.object({
	id: z.string().uuid(),
	groupId: z.string().uuid(),
	milestoneId: z.string().uuid(),
	documents: z.array(z.string().url()),
	status: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
	group: GroupDetailSchema,
	milestone: MilestoneDetailSchema,
	assignmentReviews: z.array(AssignmentReviewDetailSchema),
	reviews: z.array(z.unknown()),
});

// Legacy schemas for backward compatibility
export const SubmissionSchema = z.object({
	id: z.string().uuid(),
	groupId: z.string().uuid(),
	milestoneId: z.string().uuid(),
	createdAt: z.date(),
	updatedAt: z.date(),
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
export type User = z.infer<typeof UserSchema>;
export type Semester = z.infer<typeof SemesterSchema>;
export type GroupDetail = z.infer<typeof GroupDetailSchema>;
export type MilestoneDetail = z.infer<typeof MilestoneDetailSchema>;
export type Reviewer = z.infer<typeof ReviewerSchema>;
export type AssignmentReviewDetail = z.infer<
	typeof AssignmentReviewDetailSchema
>;
export type SubmissionDetail = z.infer<typeof SubmissionDetailSchema>;
export type Submission = z.infer<typeof SubmissionSchema>;
export type SubmissionCreate = z.infer<typeof SubmissionCreateSchema>;
export type SubmissionUpdate = z.infer<typeof SubmissionUpdateSchema>;
export type AssignmentReview = z.infer<typeof AssignmentReviewSchema>;
