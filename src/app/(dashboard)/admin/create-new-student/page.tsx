import { createMetadata } from '@/app/metadata';
import CreateNewStudentClient from '@/components/pages/admin/CreateNewStudentClient';

export const metadata = createMetadata({
	title: 'Admin Create New Student',
	description:
		'Admin Create New Student for TheSync - Group Formation and Capstone Thesis Development',
});

export default function AdminCreateNewStudentPage() {
	return <CreateNewStudentClient />;
}
