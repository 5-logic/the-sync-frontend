import { createMetadata } from '@/app/metadata';
import LecturerAssignStudentClient from '@/components/pages/lecturer/LecturerAssignStudentClient';

export const metadata = createMetadata({
	title: 'Lecturer Assign Student',
	description:
		'Lecturer Assign Student for TheSync - Group Formation and Capstone Thesis Development',
});

export default function LecturerAssignStudentPage() {
	return <LecturerAssignStudentClient />;
}
