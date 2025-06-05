import * as z from 'zod';

export const groupSchema = z.object({
	name: z
		.string()
		.nonempty({ message: 'Group name is required' })
		.max(100, { message: 'Group name must be less than 100 characters' }),

	groupDirection: z
		.string()
		.nonempty({ message: 'Group direction is required' })
		.max(100, { message: 'Group direction must be less than 100 characters' }),

	description: z
		.string()
		.nonempty({ message: 'Description is required' })
		.max(500, { message: 'Description must be less than 500 characters' }),

	requiredSkills: z
		.string()
		.nonempty({ message: 'Required skills are required' })
		.max(300, { message: 'Required skills must be less than 300 characters' }),

	expectedRoles: z
		.string()
		.nonempty({ message: 'Expected roles are required' })
		.max(300, { message: 'Expected roles must be less than 300 characters' }),
});

export type GroupData = z.infer<typeof groupSchema>;

export interface Group extends GroupData {
	id: string;
	code: string;
	semesterId: string;
	leaderId: string;
	thesisId?: string;
	lecturers?: string[];
	trackingDetails?: string[];
}
