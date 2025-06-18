import { z } from 'zod';

import { ThesisStatusSchema } from '@/schemas/_enums';

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

export const ThesisCreateSchema = ThesisSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
}).extend({
	isPublish: z.boolean().optional(),
	status: ThesisStatusSchema.default('New'),
});

export const ThesisUpdateSchema = ThesisSchema.omit({
	id: true,
	lecturerId: true,
	createdAt: true,
	updatedAt: true,
}).partial();

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
