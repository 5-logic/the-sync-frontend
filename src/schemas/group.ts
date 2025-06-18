import { z } from 'zod';

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
