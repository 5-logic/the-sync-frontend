import { createMetadata } from '@/app/metadata';
import LecturerAssignLecturerReviewClient from '@/components/pages/lecturer/LecturerAssignLecturerReviewClient';

export const metadata = createMetadata({
	title: 'Assign Lecturer Review',
	description:
		'Assign Lecturer Review for TheSync - Group Formation and Capstone Thesis Development',
});

export default function AssignLecturerReviewPage() {
	return <LecturerAssignLecturerReviewClient />;
}
