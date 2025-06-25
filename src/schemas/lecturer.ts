import { z } from 'zod';

import { UserSchema } from '@/schemas/user';

export const LecturerSchema = UserSchema.extend({
	isModerator: z.boolean().default(false),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const LecturerCreateSchema = LecturerSchema.pick({
	fullName: true,
	email: true,
	phoneNumber: true,
	gender: true,
});

export const LecturerUpdateSchema = LecturerSchema.pick({
	isModerator: true,
});

export const LecturerToggleStatusSchema = z.object({
	isActive: z.boolean().optional(),
	isModerator: z.boolean().optional(),
});

// Export inferred types
export type Lecturer = z.infer<typeof LecturerSchema>;
export type LecturerCreate = z.infer<typeof LecturerCreateSchema>;
export type LecturerUpdate = z.infer<typeof LecturerUpdateSchema>;
export type LecturerToggleStatus = z.infer<typeof LecturerToggleStatusSchema>;
