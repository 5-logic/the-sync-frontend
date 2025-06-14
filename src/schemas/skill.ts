import { z } from 'zod';

export const SkillSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1).max(100),
	skillSetId: z.string().uuid(),
});

export const SkillSetSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1).max(100),
});

export const SkillCreateSchema = SkillSchema.omit({ id: true });
export const SkillUpdateSchema = SkillSchema.omit({ id: true }).partial();

export const SkillSetCreateSchema = SkillSetSchema.omit({ id: true });
export const SkillSetUpdateSchema = SkillSetSchema.omit({ id: true }).partial();

// Export inferred types
export type Skill = z.infer<typeof SkillSchema>;
export type SkillCreate = z.infer<typeof SkillCreateSchema>;
export type SkillUpdate = z.infer<typeof SkillUpdateSchema>;
export type SkillSet = z.infer<typeof SkillSetSchema>;
export type SkillSetCreate = z.infer<typeof SkillSetCreateSchema>;
export type SkillSetUpdate = z.infer<typeof SkillSetUpdateSchema>;
