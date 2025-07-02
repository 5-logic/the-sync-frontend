import { createMetadata } from '@/app/metadata';
import AssignStudent from '@/components/features/lecturer/AssignStudent';

export const metadata = createMetadata({
	title: 'Lecturer Assign Student',
	description:
		'Lecturer Assign Student for TheSync - Group Formation and Capstone Thesis Development',
});

export default function LecturerAssignStudentPage() {
	return <AssignStudent />;
}
