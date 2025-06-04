import * as z from 'zod';

import { Group } from './group';
import { Milestone } from './milestone';

export const semesterSchema = z
	.object({
		name: z
			.string()
			.nonempty({ message: 'Name is required' })
			.max(100, { message: 'Name must be less than 100 characters' }),

		startDate: z.coerce.date({
			errorMap: () => ({
				message: 'Start date is required and must be a valid date',
			}),
		}),

		endDate: z.coerce.date({
			errorMap: () => ({
				message: 'End date is required and must be a valid date',
			}),
		}),
	})
	.refine((data) => data.endDate > data.startDate, {
		message: 'End date must be after start date',
		path: ['endDate'],
	});

export type SemesterData = z.infer<typeof semesterSchema>;

export interface Semester extends SemesterData {
	id: string;
	code: string;
	endRegistrationDate: Date;

	milestones?: Milestone[];
	groups?: Group[];
}
