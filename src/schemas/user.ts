import { z } from 'zod';

import { GenderSchema } from '@/schemas/_enums';

export const UserSchema = z.object({
	id: z.string().uuid(),
	fullName: z.string().min(1),
	email: z.string().email(),
	password: z.string().min(12),
	gender: GenderSchema,
	phoneNumber: z.string().min(1),
	isActive: z.boolean().default(true),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const UserCreateSchema = UserSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});

export const UserUpdateSchema = UserSchema.omit({
	id: true,
	password: true,
	createdAt: true,
	updatedAt: true,
}).partial();

export const UserProfileSchema = UserSchema.omit({
	password: true,
});

export const UserPasswordUpdateSchema = z
	.object({
		currentPassword: z.string().min(1),
		newPassword: z.string().min(8),
		confirmPassword: z.string().min(8),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword'],
	});

// Export inferred types
export type User = z.infer<typeof UserSchema>;
export type UserCreate = z.infer<typeof UserCreateSchema>;
export type UserUpdate = z.infer<typeof UserUpdateSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type UserPasswordUpdate = z.infer<typeof UserPasswordUpdateSchema>;
