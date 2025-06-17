import { z } from 'zod';

import { ApiResponseSchema } from './_common';

// 🔐 Password validation regex pattern
const PASSWORD_REGEX =
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// 🔐 Auth Login Requests
export const AdminLoginSchema = z.object({
	username: z
		.string()
		.min(1, 'Username is required')
		.min(3, 'Username must be at least 3 characters')
		.max(50, 'Username must not exceed 50 characters')
		.regex(
			/^[a-zA-Z0-9_]+$/,
			'Username can only contain letters, numbers, and underscores',
		),
	password: z
		.string()
		.min(1, 'Password is required')
		.min(8, 'Password must be at least 8 characters')
		.regex(
			PASSWORD_REGEX,
			'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
		),
});

export const UserLoginSchema = z.object({
	email: z
		.string()
		.min(1, 'Email is required')
		.email('Please enter a valid email address')
		.max(100, 'Email must not exceed 100 characters'),
	password: z
		.string()
		.min(1, 'Password is required')
		.min(8, 'Password must be at least 8 characters')
		.regex(
			PASSWORD_REGEX,
			'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
		),
});

// 🔐 Auth Tokens
export const TokenDataSchema = z.object({
	accessToken: z.string(),
	refreshToken: z.string(),
});

// 🔄 Refresh Token Request - chỉ cần refreshToken
export const RefreshTokenSchema = z.object({
	refreshToken: z.string().min(1, 'Refresh token is required'),
});

// 🔄 Refresh Token Response - chỉ có accessToken
export const RefreshTokenDataSchema = z.object({
	accessToken: z.string(),
});

// 🔐 User Profile from JWT
export const AuthUserSchema = z.object({
	id: z.string().uuid(),
	role: z.enum(['student', 'lecturer', 'admin']),
	username: z.string().optional(),
	email: z.string().email().optional(),
	fullName: z.string().optional(),
	isModerator: z.boolean().optional(),
});

// 🔐 Auth Response Schemas
export const LoginResponseSchema = ApiResponseSchema(TokenDataSchema);
export const RefreshResponseSchema = ApiResponseSchema(RefreshTokenDataSchema);

// 🔐 Export inferred types
export type AdminLogin = z.infer<typeof AdminLoginSchema>;
export type UserLogin = z.infer<typeof UserLoginSchema>;
export type TokenData = z.infer<typeof TokenDataSchema>;
export type RefreshToken = z.infer<typeof RefreshTokenSchema>;
export type RefreshTokenData = z.infer<typeof RefreshTokenDataSchema>;
export type AuthUser = z.infer<typeof AuthUserSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type RefreshResponse = z.infer<typeof RefreshResponseSchema>;
