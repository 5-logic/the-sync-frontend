import { createMetadata } from '@/app/metadata';
import ChecklistManagement from '@/components/features/lecturer/ChecklistManagement';

export const metadata = createMetadata({
	title: 'Lecturer Checklist Management',
	description:
		'Lecturer Checklist Management for TheSync - Group Formation and Capstone Thesis Development',
});

export default function LecturerChecklistMangementPage() {
	return <ChecklistManagement />;
}
