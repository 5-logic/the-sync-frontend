import * as z from 'zod';

import { Lecturer } from './lecturer';
import { Student } from './student';
import { Thesis } from './thesis';

export const userSchema = z.object({
	email: z
		.string()
		.email({ message: 'Invalid email address' })
		.nonempty({ message: 'Email is required' }),

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
		.regex(/^\+?[0-9]{7,15}$/, { message: 'Phone number is invalid' })
		.nonempty({ message: 'Phone number is required' }),
});

export type UserData = z.infer<typeof userSchema>;

export interface User extends UserData {
	id: string;
	isActive?: boolean;

	lecturer?: Lecturer;
	student?: Student;
	theses?: Thesis;
}
