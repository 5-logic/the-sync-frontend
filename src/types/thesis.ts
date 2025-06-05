import * as z from 'zod';

export const thesisSchema = z.object({
	englishName: z
		.string()
		.nonempty({ message: 'English name is required' })
		.max(200, { message: 'English name must be less than 200 characters' }),

	vietnameseName: z
		.string()
		.nonempty({ message: 'Vietnamese name is required' })
		.max(200, { message: 'Vietnamese name must be less than 200 characters' }),

	abbreviation: z
		.string()
		.nonempty({ message: 'Abbreviation is required' })
		.max(20, { message: 'Abbreviation must be less than 20 characters' }),

	domain: z.string().nonempty({ message: 'Domain is required' }),

	context: z.string().nonempty({ message: 'Thesis description is required' }),

	expectedOutcome: z
		.string()
		.nonempty({ message: 'Expected outcome is required' }),

	requiredSkills: z
		.string()
		.nonempty({ message: 'Required skills are required' }),

	suggestedTechnologies: z
		.string()
		.nonempty({ message: 'Suggested technologies are required' }),
});

export type ThesisData = z.infer<typeof thesisSchema>;

export interface Thesis extends ThesisData {
	id: string;
	status: 'New' | 'Pending' | 'Reject' | 'Approve';
	supportingDocument: string;
	userId: string;
	groupId: string;
}
