import { z } from 'zod';

export const MajorSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1).max(100),
	code: z.string().min(1).max(20),
});

export const MajorCreateSchema = MajorSchema.omit({ id: true });
export const MajorUpdateSchema = MajorSchema.omit({ id: true }).partial();

// Export inferred types
export type Major = z.infer<typeof MajorSchema>;
export type MajorCreate = z.infer<typeof MajorCreateSchema>;
export type MajorUpdate = z.infer<typeof MajorUpdateSchema>;
