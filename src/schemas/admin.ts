import { z } from 'zod';

export const AdminSchema = z.object({
	id: z.string().uuid(),
	username: z.string().min(6).max(50),
	password: z.string().min(12),
	email: z.string().email().optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const AdminCreateSchema = AdminSchema.pick({
	username: true,
	password: true,
}).extend({
	email: z.string().email().optional(),
});

export const AdminUpdateSchema = z.object({
	email: z.string().email().optional(),
	oldPassword: z.string().min(12).optional(),
	newPassword: z.string().min(12).optional(),
});

export const AdminProfileSchema = AdminSchema.omit({ password: true });

// Export inferred types
export type Admin = z.infer<typeof AdminSchema>;
export type AdminCreate = z.infer<typeof AdminCreateSchema>;
export type AdminUpdate = z.infer<typeof AdminUpdateSchema>;
export type AdminProfile = z.infer<typeof AdminProfileSchema>;
