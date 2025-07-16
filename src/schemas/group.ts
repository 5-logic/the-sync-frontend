import { z } from 'zod';

import { ApiResponseSchema } from '@/schemas/_common';
import { MajorSchema } from '@/schemas/major';
import { ResponsibilitySchema } from '@/schemas/responsibility';
import { SemesterSchema } from '@/schemas/semester';
import { SkillSchema, SkillSetSchema } from '@/schemas/skill';
import { UserSchema } from '@/schemas/user';

// ===== EXISTING GROUP SCHEMAS =====

export const GroupSchema = z.object({
	id: z.string().uuid(),
	code: z.string().min(1),
	name: z.string().min(1),
	projectDirection: z.string().nullable().optional(),
	semesterId: z.string().uuid(),
	thesisId: z.string().uuid().nullable().optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const GroupRequiredSkillSchema = z.object({
	groupId: z.string().uuid(),
	skillId: z.string().uuid(),
});

export const GroupCreateSchema = GroupSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});

export const GroupUpdateSchema = GroupSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
}).partial();

// Export inferred types
export type Group = z.infer<typeof GroupSchema>;
export type GroupCreate = z.infer<typeof GroupCreateSchema>;
export type GroupUpdate = z.infer<typeof GroupUpdateSchema>;
export type GroupRequiredSkill = z.infer<typeof GroupRequiredSkillSchema>;

// ===== GROUP DASHBOARD SCHEMAS =====

// Group member schema - combining User and other info
export const GroupMemberSchema = z.object({
	userId: z.string().uuid(),
	studentCode: z.string(),
	user: UserSchema.omit({ password: true }), // Use existing UserSchema without password
	major: MajorSchema.omit({ createdAt: true, updatedAt: true }), // Use existing MajorSchema
	isLeader: z.boolean(),
});

// Group skill schema - extending existing SkillSchema with SkillSet info
export const GroupSkillSchema = SkillSchema.omit({
	createdAt: true,
	updatedAt: true,
	skillSetId: true,
}).extend({
	skillSet: SkillSetSchema.omit({
		createdAt: true,
		updatedAt: true,
		skills: true,
	}),
});

// Participation schema
export const ParticipationSchema = z.object({
	isLeader: z.boolean(),
	semester: SemesterSchema.omit({
		createdAt: true,
		updatedAt: true,
		maxGroup: true,
		ongoingPhase: true,
	}),
});

// Main Group Dashboard schema - extending existing GroupSchema
export const GroupDashboardSchema = GroupSchema.omit({
	createdAt: true,
	updatedAt: true,
	semesterId: true,
	thesisId: true,
}).extend({
	createdAt: z.string(),
	updatedAt: z.string(),
	semester: SemesterSchema.omit({
		createdAt: true,
		updatedAt: true,
		maxGroup: true,
		ongoingPhase: true,
	}),
	thesis: z.null().or(
		z.object({
			id: z.string().uuid(),
			englishName: z.string(),
			vietnameseName: z.string(),
			abbreviation: z.string(),
			description: z.string(),
			status: z.string(),
			domain: z.string(),
		}),
	), // null or thesis object with actual properties
	skills: z.array(GroupSkillSchema),
	responsibilities: z.array(ResponsibilitySchema), // Use existing ResponsibilitySchema
	members: z.array(GroupMemberSchema),
	leader: GroupMemberSchema,
	participation: ParticipationSchema,
});

// API Response schema
export const GroupDashboardApiResponseSchema = ApiResponseSchema(
	z.array(GroupDashboardSchema),
);

// Export additional types for dashboard
export type GroupDashboard = z.infer<typeof GroupDashboardSchema>;
export type GroupMember = z.infer<typeof GroupMemberSchema>;
export type GroupSkill = z.infer<typeof GroupSkillSchema>;
export type Participation = z.infer<typeof ParticipationSchema>;
