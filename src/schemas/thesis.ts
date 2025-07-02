import { z } from 'zod';

import { ThesisStatusSchema } from '@/schemas/_enums';

// Common field definitions to reduce duplication
const uuidField = z.string().uuid();
const optionalUuidField = z.string().uuid().nullable().optional();
const stringMinOneField = z.string().min(1);
const timestampFields = {
	createdAt: z.date(),
	updatedAt: z.date(),
} as const;

export const ThesisSchema = z.object({
	id: uuidField,
	englishName: stringMinOneField,
	vietnameseName: stringMinOneField,
	abbreviation: stringMinOneField,
	description: stringMinOneField,
	domain: z.string().nullable().optional(),
	status: ThesisStatusSchema,
	isPublish: z.boolean().default(false),
	groupId: optionalUuidField,
	lecturerId: uuidField,
	...timestampFields,
});

export const ThesisVersionSchema = z.object({
	id: uuidField,
	version: z.number().int().positive(),
	supportingDocument: stringMinOneField,
	thesisId: uuidField,
	...timestampFields,
});

export const ThesisRequiredSkillSchema = z.object({
	thesisId: uuidField,
	skillId: uuidField,
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
	...createOmitFields,
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

export const ThesisVersionCreateSchema =
	ThesisVersionSchema.omit(createOmitFields);

export const ThesisVersionUpdateSchema = ThesisVersionSchema.omit({
	...createOmitFields,
	thesisId: true,
}).partial();

export const ThesisRequiredSkillCreateSchema = ThesisRequiredSkillSchema;

// Export inferred types - grouped for better organization
export type Thesis = z.infer<typeof ThesisSchema>;
export type ThesisWithRelations = z.infer<typeof ThesisWithRelationsSchema>;
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
