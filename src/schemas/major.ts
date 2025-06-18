import { z } from 'zod';

export const MajorSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1),
	code: z.string().min(1),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const MajorCreateSchema = MajorSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});

export const MajorUpdateSchema = MajorSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
}).partial();

// Export inferred types
export type Major = z.infer<typeof MajorSchema>;
export type MajorCreate = z.infer<typeof MajorCreateSchema>;
export type MajorUpdate = z.infer<typeof MajorUpdateSchema>;
