import { z } from 'zod';

import { GenderSchema } from '@/schemas/_enums';

export const UserSchema = z.object({
	id: z.string().uuid(),
	fullName: z.string().min(1).max(100),
	email: z.string().email(),
	password: z.string().min(6),
	gender: GenderSchema,
	phoneNumber: z
		.string()
		.regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format'),
	isActive: z.boolean().default(true),
});

export const UserCreateSchema = UserSchema.omit({ id: true });
export const UserUpdateSchema = UserSchema.omit({
	id: true,
	password: true,
}).partial();
export const UserProfileSchema = UserSchema.omit({ password: true });

// Export inferred types
export type User = z.infer<typeof UserSchema>;
export type UserCreate = z.infer<typeof UserCreateSchema>;
export type UserUpdate = z.infer<typeof UserUpdateSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
