import { z } from 'zod';

import { SkillLevelSchema } from '@/schemas/_enums';
import { UserSchema } from '@/schemas/user';

export const StudentSchema = UserSchema.extend({
	studentId: z.string().min(1).max(6),
	majorId: z.string().uuid(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const StudentSkillSchema = z.object({
	studentId: z.string(),
	skillId: z.string().uuid(),
	level: SkillLevelSchema,
});

export const StudentCreateSchema = StudentSchema.omit({
	studentId: true,
	createdAt: true,
	updatedAt: true,
}).extend({
	majorId: z.string().uuid(),
});

export const StudentUpdateSchema = StudentSchema.pick({
	studentId: true,
})
	.extend({
		majorId: z.string().uuid().optional(),
	})
	.partial();

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
