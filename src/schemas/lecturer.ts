import { z } from 'zod';

import { UserSchema } from '@/schemas/user';

export const LecturerSchema = UserSchema.extend({
	isModerator: z.boolean().default(false),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const LecturerCreateSchema = LecturerSchema.omit({
	createdAt: true,
	updatedAt: true,
}).extend({
	isModerator: z.boolean().optional(),
});

export const LecturerUpdateSchema = LecturerSchema.pick({
	isModerator: true,
});

// Export inferred types
export type Lecturer = z.infer<typeof LecturerSchema>;
export type LecturerCreate = z.infer<typeof LecturerCreateSchema>;
export type LecturerUpdate = z.infer<typeof LecturerUpdateSchema>;
