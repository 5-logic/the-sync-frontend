import { z } from 'zod';

export const LecturerSchema = z.object({
	userId: z.string().uuid(),
	isModerator: z.boolean().default(false),
});

export const LecturerCreateSchema = LecturerSchema.pick({
	userId: true,
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
