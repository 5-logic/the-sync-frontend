import { createMetadata } from '@/app/metadata';
import AssignStudentsDetailPage from '@/components/features/lecturer/AssignStudentDetail';

export const metadata = createMetadata({
	title: 'Lecturer Assign Student Detail',
	description:
		'Lecturer Assign Student Detail for TheSync - Group Formation and Capstone Thesis Development',
});

export default function LecturerAssignStudentDetailPage() {
	return <AssignStudentsDetailPage />;
}
