import * as z from 'zod';

import { Feedback } from './feedback';
import { Group } from './group';
import { User } from './user';

export const lecturerSchema = z.object({
	fullName: z
		.string()
		.nonempty({ message: 'Full name is required' })
		.max(100, { message: 'Full name must be less than 100 characters' }),

	email: z
		.string()
		.email({ message: 'Invalid email address' })
		.nonempty({ message: 'Email is required' }),

	phoneNumber: z
		.string()
		.regex(/^\+?[0-9]{7,15}$/, { message: 'Phone number is invalid' })
		.nonempty({ message: 'Phone number is required' }),

	gender: z.enum(['Male', 'Female'], {
		required_error: 'Gender is required',
	}),
});

export type LecturerData = z.infer<typeof lecturerSchema>;

export interface Lecturer extends LecturerData {
	userId: string;
	isModerator?: boolean;

	user?: User;
	groups?: Group[];
	feedbacks?: Feedback[];
}
