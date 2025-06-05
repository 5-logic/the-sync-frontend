import * as z from 'zod';

export const userSchema = z.object({
	email: z
		.string()
		.nonempty({ message: 'Email is required' })
		.email({ message: 'Invalid email address' }),

	fullName: z
		.string()
		.nonempty({ message: 'Full name is required' })
		.max(100, { message: 'Full name must be less than 100 characters' }),

	password: z
		.string()
		.min(8, { message: 'Password must be at least 8 characters' })
		.max(100, { message: 'Password must be less than 100 characters' }),

	gender: z.enum(['Male', 'Female'], {
		required_error: 'Gender is required',
	}),

	phoneNumber: z
		.string()
		.nonempty({ message: 'Phone number is required' })
		.regex(/^\+?[0-9]{7,15}$/, { message: 'Phone number is invalid' }),
});

export type UserData = z.infer<typeof userSchema>;

export interface User extends UserData {
	id: string;
	isActive?: boolean;
}
