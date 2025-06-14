import { z } from 'zod';

import { SkillLevelSchema } from '@/schemas/_enums';

export const StudentSchema = z.object({
	userId: z.string().uuid(),
	studentId: z.string().min(1),
	majorId: z.string().uuid(),
});

export const StudentSkillSchema = z.object({
	studentId: z.string(),
	skillId: z.string().uuid(),
	level: SkillLevelSchema,
});

export const StudentCreateSchema = StudentSchema;
export const StudentUpdateSchema = StudentSchema.pick({
	studentId: true,
	majorId: true,
}).partial();

export const StudentSkillCreateSchema = StudentSkillSchema;
export const StudentSkillUpdateSchema = StudentSkillSchema.pick({
	studentId: true,
	skillId: true,
}).extend({
	level: SkillLevelSchema.optional(),
});

// Export inferred types
export type Student = z.infer<typeof StudentSchema>;
export type StudentCreate = z.infer<typeof StudentCreateSchema>;
export type StudentUpdate = z.infer<typeof StudentUpdateSchema>;
export type StudentSkill = z.infer<typeof StudentSkillSchema>;
export type StudentSkillCreate = z.infer<typeof StudentSkillCreateSchema>;
export type StudentSkillUpdate = z.infer<typeof StudentSkillUpdateSchema>;
