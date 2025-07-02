import { createMetadata } from '@/app/metadata';
import ChecklistManager from '@/components/features/lecturer/ChecklistManager';

export const metadata = createMetadata({
	title: 'Lecturer Checklist Management',
	description:
		'Lecturer Checklist Management for TheSync - Group Formation and Capstone Thesis Development',
});

export default function LecturerChecklistMangementPage() {
	return <ChecklistManager />;
}
