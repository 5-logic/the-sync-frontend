import * as z from 'zod';

export const semesterSchema = z
	.object({
		name: z
			.string()
			.nonempty({ message: 'Name is required' })
			.max(100, { message: 'Name must be less than 100 characters' }),

		startDate: z.date({
			required_error: 'Start date is required',
			invalid_type_error: 'Start date must be a valid date',
		}),

		endDate: z.date({
			required_error: 'End date is required',
			invalid_type_error: 'End date must be a valid date',
		}),

		endRegistrationDate: z.date({
			required_error: 'End registration date is required',
			invalid_type_error: 'End registration date must be a valid date',
		}),
	})
	.refine((data) => data.endDate > data.startDate, {
		message: 'End date must be after start date',
		path: ['endDate'],
	})
	.refine((data) => data.endRegistrationDate <= data.endDate, {
		message:
			'Registration end date must be before or equal to semester end date',
		path: ['endRegistrationDate'],
	});

export type SemesterData = z.infer<typeof semesterSchema>;

export interface Semester extends SemesterData {
	id: string;
	code: string;
}
