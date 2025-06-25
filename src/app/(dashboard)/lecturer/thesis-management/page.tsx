import { createMetadata } from '@/app/metadata';
import ThesisManagementClient from '@/components/pages/lecturer/ThesisManagementClient';

export const metadata = createMetadata({
	title: 'Lecturer Thesis Management',
	description:
		'Lecturer Thesis Management for TheSync - Group Formation and Capstone Thesis Development',
});

export default function AdminThesisManagementPage() {
	return <ThesisManagementClient />;
}
