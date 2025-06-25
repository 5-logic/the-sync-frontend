import { z } from 'zod';

import { GenderSchema, SkillLevelSchema } from '@/schemas/_enums';
import { UserSchema } from '@/schemas/user';

export const StudentSchema = UserSchema.extend({
	studentId: z.string().min(1).max(6),
	majorId: z.string().uuid(),
});

export const StudentSkillSchema = z.object({
	studentId: z.string(),
	skillId: z.string().uuid(),
	level: SkillLevelSchema,
});

export const StudentCreateSchema = StudentSchema.extend({
	semesterId: z.string().uuid(),
})
	.omit({
		id: true,
		password: true,
		isActive: true,
		createdAt: true,
		updatedAt: true,
	})
	.extend({
		majorId: z.string().uuid(),
	});

// Schema for individual student in import operation
export const ImportStudentItemSchema = z.object({
	studentId: z.string().min(1).max(6),
	email: z.string().email(),
	fullName: z.string().min(1),
	password: z.string().min(12),
	gender: GenderSchema,
	phoneNumber: z.string().min(1),
});

// Schema for batch import operation
export const ImportStudentSchema = z.object({
	semesterId: z.string().uuid(),
	majorId: z.string().uuid(),
	students: z.array(ImportStudentItemSchema).min(1),
});

export const StudentUpdateSchema = StudentSchema.pick({
	fullName: true,
	gender: true,
	phoneNumber: true,
}).partial();

export const StudentToggleStatusSchema = StudentSchema.pick({
	isActive: true,
});

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
export type StudentToggleStatus = z.infer<typeof StudentToggleStatusSchema>;
export type ImportStudentItem = z.infer<typeof ImportStudentItemSchema>;
export type ImportStudent = z.infer<typeof ImportStudentSchema>;
export type StudentSkill = z.infer<typeof StudentSkillSchema>;
export type StudentSkillCreate = z.infer<typeof StudentSkillCreateSchema>;
export type StudentSkillUpdate = z.infer<typeof StudentSkillUpdateSchema>;
