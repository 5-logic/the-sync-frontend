import { createMetadata } from '@/app/metadata';
import ChecklistManagementClient from '@/components/pages/lecturer/ChecklistManagementClient';

export const metadata = createMetadata({
	title: 'Lecturer Checklist Management',
	description:
		'Lecturer Checklist Management for TheSync - Group Formation and Capstone Thesis Development',
});

export default function LecturerChecklistMangementPage() {
	return <ChecklistManagementClient />;
}
