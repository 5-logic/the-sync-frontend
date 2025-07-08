import { createMetadata } from '@/app/metadata';
import StudentHomePage from '@/components/features/student/Home';

export const metadata = createMetadata({
	title: 'Student Dashboard',
	description:
		'LStudent Dashboard for TheSync - Group Formation and Capstone Thesis Development',
});

export default function AdminThesisManagementPage() {
	return <StudentHomePage />;
}
