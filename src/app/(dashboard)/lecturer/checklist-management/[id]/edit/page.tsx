import { createMetadata } from '@/app/metadata';
import ChecklistEdit from '@/components/features/lecturer/ChecklistEdit';

export const metadata = createMetadata({
	title: 'Lecturer Edit Checklist',
	description:
		'Lecturer Edit Checklist for TheSync - Group Formation and Capstone Thesis Development',
});

export default function EditChecklistPage() {
	return <ChecklistEdit />;
}
