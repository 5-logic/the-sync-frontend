// data/review.ts

export type Review = {
	lecturerId: string;
	submissionId: string;
};

export const mockReviews: Review[] = [
	{ lecturerId: 'l6', submissionId: 's1' }, // John Smith
	{ lecturerId: 'l1', submissionId: 's1' }, // Sarah Johnson
	{ lecturerId: 'l3', submissionId: 's2' }, // Emily Wong
	{ lecturerId: 'l5', submissionId: 's2' }, // Martinez
	{ lecturerId: 'l2', submissionId: 's3' }, // Davis
	{ lecturerId: 'l7', submissionId: 's3' }, // Lan
	{ lecturerId: 'l4', submissionId: 's4' }, // Michael Chen
	{ lecturerId: 'l5', submissionId: 's4' }, // Martinez
];
