import { createMetadata } from '@/app/metadata';
import StudentManagementClient from '@/components/pages/StudentManagementClient';

export const metadata = createMetadata({
	title: 'Admin Student Management',
	description:
		'Admin Student Management for TheSync - Group Formation and Capstone Thesis Development',
});

export default function AdminStudentManagementPage() {
	return <StudentManagementClient />;
}
