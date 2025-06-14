import { z } from 'zod';

export const AdminSchema = z.object({
	id: z.string().uuid(),
	username: z.string().min(6).max(50),
	password: z.string().min(12),
	email: z.string().email().optional(),
});

export const AdminCreateSchema = AdminSchema.pick({
	username: true,
	password: true,
}).extend({
	email: z.string().email().optional(),
});

export const AdminUpdateSchema = AdminSchema.pick({
	username: true,
	email: true,
}).partial();

// Export inferred types
export type Admin = z.infer<typeof AdminSchema>;
export type AdminCreate = z.infer<typeof AdminCreateSchema>;
export type AdminUpdate = z.infer<typeof AdminUpdateSchema>;
