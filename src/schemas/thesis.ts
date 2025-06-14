import { z } from 'zod';

import { ThesisStatusSchema } from '@/schemas/_enums';

export const ThesisSchema = z.object({
	id: z.string().uuid(),
	englishName: z.string().min(1).max(200),
	vietnameseName: z.string().min(1).max(200),
	abbreviation: z.string().min(1).max(20),
	description: z.string().min(1),
	domain: z.string().optional(),
	status: ThesisStatusSchema,
	isPublish: z.boolean().default(false),
	groupId: z.string().uuid().optional(),
	userId: z.string().uuid(),
});

export const ThesisVersionSchema = z.object({
	id: z.string().uuid(),
	version: z.number().int().positive(),
	supportingDocument: z.string().min(1),
	thesisId: z.string().uuid(),
});

export const ThesisRequiredSkillSchema = z.object({
	thesisId: z.string().uuid(),
	skillId: z.string().uuid(),
});

export const ThesisCreateSchema = ThesisSchema.omit({ id: true }).extend({
	isPublish: z.boolean().optional(),
});

export const ThesisUpdateSchema = ThesisSchema.omit({
	id: true,
	userId: true,
}).partial();
export const ThesisPublicSchema = ThesisSchema.omit({ userId: true });
export const ThesisVersionCreateSchema = ThesisVersionSchema.omit({ id: true });

// Export inferred types
export type Thesis = z.infer<typeof ThesisSchema>;
export type ThesisCreate = z.infer<typeof ThesisCreateSchema>;
export type ThesisUpdate = z.infer<typeof ThesisUpdateSchema>;
export type ThesisPublic = z.infer<typeof ThesisPublicSchema>;
export type ThesisVersion = z.infer<typeof ThesisVersionSchema>;
export type ThesisVersionCreate = z.infer<typeof ThesisVersionCreateSchema>;
export type ThesisRequiredSkill = z.infer<typeof ThesisRequiredSkillSchema>;
