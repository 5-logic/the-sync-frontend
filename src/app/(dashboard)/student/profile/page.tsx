import { createMetadata } from '@/app/metadata';
import StudentProfile from '@/components/features/student/Profile';

export const metadata = createMetadata({
	title: 'Student Profile',
	description:
		'Student Profile for TheSync - Group Formation and Capstone Thesis Development',
});

export default function StudentProfilePage() {
	return <StudentProfile />;
}
