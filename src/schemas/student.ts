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

// Schema for student self-update (profile update)
export const StudentSelfUpdateSchema = z.object({
	fullName: z.string().min(1).optional(),
	gender: GenderSchema.optional(),
	phoneNumber: z.string().min(1).optional(),
	studentSkills: z
		.array(
			z.object({
				skillId: uuidField,
				level: SkillLevelSchema,
			}),
		)
		.optional(),
	studentExpectedResponsibilities: z
		.array(
			z.object({
				responsibilityId: uuidField,
			}),
		)
		.optional(),
});

// Schema for detailed student profile response
export const StudentProfileSchema = z.object({
	id: uuidField,
	fullName: z.string(),
	email: z.string().email(),
	gender: GenderSchema,
	phoneNumber: z.string(),
	isActive: z.boolean(),
	createdAt: z.string().transform((val) => new Date(val)),
	updatedAt: z.string().transform((val) => new Date(val)),
	studentCode: z.string(),
	majorId: uuidField,
	major: z.object({
		id: uuidField,
		name: z.string(),
		code: z.string(),
	}),
	enrollments: z.array(
		z.object({
			status: z.string(),
			semester: z.object({
				id: uuidField,
				name: z.string(),
				code: z.string(),
				status: z.string(),
			}),
		}),
	),
	studentSkills: z.array(
		z.object({
			skillId: uuidField,
			skillName: z.string(),
			level: SkillLevelSchema,
			skillSet: z.object({
				id: uuidField,
				name: z.string(),
			}),
		}),
	),
	studentExpectedResponsibilities: z.array(
		z.object({
			responsibilityId: uuidField,
			responsibilityName: z.string(),
		}),
	),
});

export const StudentToggleStatusSchema = StudentSchema.pick({
	isActive: true,
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
export type StudentSelfUpdate = z.infer<typeof StudentSelfUpdateSchema>;
export type StudentProfile = z.infer<typeof StudentProfileSchema>;
export type StudentToggleStatus = z.infer<typeof StudentToggleStatusSchema>;

export type ImportStudentItem = z.infer<typeof ImportStudentItemSchema>;
export type ImportStudent = z.infer<typeof ImportStudentSchema>;

export type StudentSkill = z.infer<typeof StudentSkillSchema>;
export type StudentSkillCreate = z.infer<typeof StudentSkillCreateSchema>;
export type StudentSkillUpdate = z.infer<typeof StudentSkillUpdateSchema>;
