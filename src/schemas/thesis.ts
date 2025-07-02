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

// Common omit patterns
const createOmitFields = {
	id: true,
	createdAt: true,
	updatedAt: true,
} as const;

export const ThesisCreateSchema = ThesisSchema.omit(createOmitFields).extend({
	isPublish: z.boolean().optional(),
	status: ThesisStatusSchema.default('New'),
});

export const ThesisUpdateSchema = ThesisSchema.omit({
	...createOmitFields,
	lecturerId: true,
}).partial();

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
