import { createMetadata } from '@/app/metadata';
import CreateChecklist from '@/components/features/lecturer/CreateChecklist';

export const metadata = createMetadata({
	title: 'Lecturer Create Checklist',
	description:
		'Lecturer Create Checlist for TheSync - Group Formation and Capstone Thesis Development',
});

export default function CreateChecklistPage() {
	return <CreateChecklist />;
}
