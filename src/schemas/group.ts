import { z } from 'zod';

export const GroupSchema = z.object({
	id: z.string().uuid(),
	code: z.string().min(1).max(50),
	name: z.string().min(1).max(100),
	projectDirection: z.string().optional(),
	semesterId: z.string().uuid(),
	thesisId: z.string().uuid().optional(),
});

export const GroupRequiredSkillSchema = z.object({
	groupId: z.string().uuid(),
	skillId: z.string().uuid(),
});

export const GroupCreateSchema = GroupSchema.omit({ id: true });
export const GroupUpdateSchema = GroupSchema.omit({ id: true }).partial();

// Export inferred types
export type Group = z.infer<typeof GroupSchema>;
export type GroupCreate = z.infer<typeof GroupCreateSchema>;
export type GroupUpdate = z.infer<typeof GroupUpdateSchema>;
export type GroupRequiredSkill = z.infer<typeof GroupRequiredSkillSchema>;
