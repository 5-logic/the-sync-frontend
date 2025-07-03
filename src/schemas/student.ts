import { z } from 'zod';

import { GenderSchema, SkillLevelSchema } from '@/schemas/_enums';
import { UserSchema } from '@/schemas/user';

// Common field definitions to reduce duplication
const uuidField = z.string().uuid();
const studentCodeField = z.string().min(1).max(6);
const stringMinOneField = z.string().min(1);

export const StudentSchema = UserSchema.extend({
	studentCode: studentCodeField,
	majorId: uuidField,
});

export const StudentSkillSchema = z.object({
	studentCode: z.string(),
	skillId: uuidField,
	level: SkillLevelSchema,
});

// Common omit patterns
const createOmitFields = {
	id: true,
	createdAt: true,
	updatedAt: true,
} as const;

const studentCreateOmitFields = {
	...createOmitFields,
	password: true,
	isActive: true,
} as const;

export const StudentCreateSchema = StudentSchema.extend({
	semesterId: uuidField,
})
	.omit(studentCreateOmitFields)
	.extend({
		majorId: uuidField,
	});

// Schema for individual student in import operation
export const ImportStudentItemSchema = z.object({
	studentCode: studentCodeField,
	email: z.string().email(),
	fullName: stringMinOneField,
	password: z.string().min(12),
	gender: GenderSchema,
	phoneNumber: stringMinOneField,
});

// Schema for batch import operation
export const ImportStudentSchema = z.object({
	semesterId: uuidField,
	majorId: uuidField,
	students: z.array(ImportStudentItemSchema).min(1),
});

export const StudentUpdateSchema = StudentSchema.pick({
	studentCode: true,
	email: true,
	fullName: true,
	gender: true,
	phoneNumber: true,
	majorId: true,
}).partial();

export const StudentToggleStatusSchema = StudentSchema.pick({
	isActive: true,
});

export const StudentPasswordUpdateSchema = z.object({
	currentPassword: z.string().min(1),
	newPassword: z.string().min(12),
});

export const StudentSkillCreateSchema = StudentSkillSchema;
export const StudentSkillUpdateSchema = StudentSkillSchema.pick({
	studentCode: true,
	skillId: true,
}).extend({
	level: SkillLevelSchema.optional(),
});

// Export inferred types - grouped for better organization
export type Student = z.infer<typeof StudentSchema>;
export type StudentCreate = z.infer<typeof StudentCreateSchema>;
export type StudentUpdate = z.infer<typeof StudentUpdateSchema>;
export type StudentToggleStatus = z.infer<typeof StudentToggleStatusSchema>;
export type StudentPasswordUpdate = z.infer<typeof StudentPasswordUpdateSchema>;

export type ImportStudentItem = z.infer<typeof ImportStudentItemSchema>;
export type ImportStudent = z.infer<typeof ImportStudentSchema>;

export type StudentSkill = z.infer<typeof StudentSkillSchema>;
export type StudentSkillCreate = z.infer<typeof StudentSkillCreateSchema>;
export type StudentSkillUpdate = z.infer<typeof StudentSkillUpdateSchema>;
