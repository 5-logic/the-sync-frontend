import { z } from 'zod';

export const SkillSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1),
	skillSetId: z.string().uuid(),
	createdAt: z.string().transform((val) => new Date(val)),
	updatedAt: z.string().transform((val) => new Date(val)),
});

export const SkillSetSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1),
	createdAt: z.string().transform((val) => new Date(val)),
	updatedAt: z.string().transform((val) => new Date(val)),
	skills: z.array(SkillSchema),
});

export const SkillSetApiResponseSchema = z.object({
	success: z.boolean(),
	statusCode: z.number(),
	data: z.array(SkillSetSchema),
});

export const SkillCreateSchema = SkillSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});

export const SkillUpdateSchema = SkillSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
}).partial();

export const SkillSetCreateSchema = SkillSetSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});

export const SkillSetUpdateSchema = SkillSetSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
}).partial();

// Export inferred types
export type Skill = z.infer<typeof SkillSchema>;
export type SkillCreate = z.infer<typeof SkillCreateSchema>;
export type SkillUpdate = z.infer<typeof SkillUpdateSchema>;
export type SkillSet = z.infer<typeof SkillSetSchema>;
export type SkillSetCreate = z.infer<typeof SkillSetCreateSchema>;
export type SkillSetUpdate = z.infer<typeof SkillSetUpdateSchema>;
export type SkillSetApiResponse = z.infer<typeof SkillSetApiResponseSchema>;
