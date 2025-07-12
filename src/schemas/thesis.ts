import { z } from 'zod';

import { ThesisStatusSchema } from '@/schemas/_enums';
import { SupervisionSchema, SupervisorInfoSchema } from '@/schemas/supervision';

export const ThesisSchema = z.object({
	id: z.string().uuid(),
	englishName: z.string().min(1),
	vietnameseName: z.string().min(1),
	abbreviation: z.string().min(1),
	description: z.string().min(1),
	domain: z.string().nullable().optional(),
	status: ThesisStatusSchema,
	isPublish: z.boolean().default(false),
	groupId: z.string().uuid().nullable().optional(),
	lecturerId: z.string().uuid(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const ThesisVersionSchema = z.object({
	id: z.string().uuid(),
	version: z.number().int().positive(),
	supportingDocument: z.string().min(1),
	thesisId: z.string().uuid(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const ThesisRequiredSkillSchema = z.object({
	thesisId: z.string().uuid(),
	skillId: z.string().uuid(),
});

// Schema for creating thesis with skills (only skillId needed)
export const ThesisRequiredSkillForCreateSchema = z.object({
	skillId: z.string().uuid(),
});

export const ThesisCreateSchema = z.object({
	englishName: z.string().min(1),
	vietnameseName: z.string().min(1),
	abbreviation: z.string().min(1),
	description: z.string().min(1),
	domain: z.string().optional(),
	supportingDocument: z.string().min(1),
	skillIds: z.array(z.string().uuid()).optional(),
});

export const ThesisUpdateSchema = ThesisSchema.omit({
	id: true,
	lecturerId: true,
	createdAt: true,
	updatedAt: true,
})
	.partial()
	.extend({
		skillIds: z.array(z.string().uuid()).optional(),
		supportingDocument: z.string().optional(),
	});

export const ThesisPublicSchema = ThesisSchema.omit({
	lecturerId: true,
});

export const ThesisVersionCreateSchema = ThesisVersionSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});

export const ThesisVersionUpdateSchema = ThesisVersionSchema.omit({
	id: true,
	thesisId: true,
	createdAt: true,
	updatedAt: true,
}).partial();

export const ThesisRequiredSkillCreateSchema = ThesisRequiredSkillSchema;

// Export inferred types
export type Thesis = z.infer<typeof ThesisSchema>;
export type ThesisWithRelations = z.infer<typeof ThesisWithRelationsSchema>;
export type ThesisWithGroup = z.infer<typeof ThesisWithGroupSchema>;
export type GroupInfo = z.infer<typeof GroupInfoSchema>;
export type ThesisCreate = z.infer<typeof ThesisCreateSchema>;
export type ThesisUpdate = z.infer<typeof ThesisUpdateSchema>;
export type ThesisPublic = z.infer<typeof ThesisPublicSchema>;
export type ThesisVersion = z.infer<typeof ThesisVersionSchema>;
export type ThesisVersionCreate = z.infer<typeof ThesisVersionCreateSchema>;
export type ThesisVersionUpdate = z.infer<typeof ThesisVersionUpdateSchema>;
export type ThesisRequiredSkill = z.infer<typeof ThesisRequiredSkillSchema>;
export type ThesisRequiredSkillCreate = z.infer<
	typeof ThesisRequiredSkillCreateSchema
>;
export type ThesisRequiredSkillForCreate = z.infer<
	typeof ThesisRequiredSkillForCreateSchema
>;

// Re-export supervision-related types for convenience
export type { Supervision, SupervisorInfo } from '@/schemas/supervision';

export const GroupInfoSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	memberCount: z.number(),
});

// Enhanced thesis interface with supervision and group information
export const ThesisWithGroupSchema = ThesisSchema.extend({
	supervisor: SupervisorInfoSchema.nullable(),
	group: GroupInfoSchema.nullable(),
	supervisions: z.array(SupervisionSchema),
});

// Extended schema for API responses that include relationships
export const ThesisWithRelationsSchema = ThesisSchema.extend({
	thesisRequiredSkills: z
		.array(
			z.object({
				thesisId: z.string().uuid(),
				skillId: z.string().uuid(),
				skill: z.object({
					id: z.string().uuid(),
					name: z.string(),
				}),
			}),
		)
		.optional(),
	thesisVersions: z
		.array(
			z.object({
				id: z.string().uuid(),
				version: z.number(),
				supportingDocument: z.string(),
			}),
		)
		.optional(),
});
