import * as z from 'zod';

import { Semester } from './semestor';
import { TrackingDetail } from './trackingDetail';

export const milestoneSchema = z
	.object({
		semesterId: z.string().nonempty({ message: 'Semester is required' }),

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

export type MilestoneData = z.infer<typeof milestoneSchema>;

export interface Milestone extends MilestoneData {
	id: string;
	name: string;

	semester?: Semester;
	trackingDetails?: TrackingDetail[];
}
