import { z } from 'zod';

import { AdminLoginSchema, UserLoginSchema } from '@/schemas/auth';

/**
 * 🔐 Login Form Validation Utilities
 * Shared validation logic for login forms
 */

/**
 * Generic validation rule generator
 */
const createValidationRule = (
	fieldName: string,
	schema: z.ZodSchema,
	errorMessage: string,
) => [
	{
		validator: (_: unknown, value: string) => {
			if (!value) {
				return Promise.reject(new Error(`${fieldName} is required`));
			}
			try {
				schema.parse({ [fieldName.toLowerCase()]: value });
				return Promise.resolve();
			} catch (error) {
				if (error instanceof z.ZodError) {
					return Promise.reject(new Error(error.errors[0].message));
				}
				return Promise.reject(new Error(errorMessage));
			}
		},
	},
];

/**
 * Admin validation rules
 */
export const getAdminUsernameValidationRules = () =>
	createValidationRule(
		'Username',
		z.object({ username: AdminLoginSchema.shape.username }),
		'Invalid username',
	);

export const getAdminPasswordValidationRules = () =>
	createValidationRule(
		'Password',
		z.object({ password: AdminLoginSchema.shape.password }),
		'Invalid password',
	);

/**
 * User validation rules
 */
export const getUserEmailValidationRules = () =>
	createValidationRule(
		'Email',
		z.object({ email: UserLoginSchema.shape.email }),
		'Invalid email',
	);

export const getUserPasswordValidationRules = () =>
	createValidationRule(
		'Password',
		z.object({ password: UserLoginSchema.shape.password }),
		'Invalid password',
	);
