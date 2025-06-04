import * as z from 'zod';

import { Group } from './group';
import { Major } from './major';
import { User } from './user';

export const studentSchema = z.object({
	fullName: z
		.string()
		.nonempty({ message: 'Full name is required' })
		.max(100, { message: 'Full name must be less than 100 characters' }),

	email: z
		.string()
		.email({ message: 'Invalid email address' })
		.nonempty({ message: 'Email is required' }),

	studentId: z.string().nonempty({ message: 'Student ID is required' }),

	gender: z.enum(['Male', 'Female'], {
		required_error: 'Gender is required',
	}),
});

export type StudentData = z.infer<typeof studentSchema>;

export interface Student extends StudentData {
	userId: string;
	roles?: string;
	skills?: string;
	academicInterests?: string;
	majorId: string;

	user?: User;
	major?: Major;
	groups?: Group[];
}
