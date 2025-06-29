import { createMetadata } from '@/app/metadata';
import ThesisVersionControl from '@/components/features/lecturer/ThesisVersionControl';

export const metadata = createMetadata({
	title: 'Lecturer Thesis Version Control',
	description:
		'Lecturer Thesis Version Control for TheSync - Group Formation and Capstone Thesis Development',
});

export default function AdminThesisManagementPage() {
	return <ThesisVersionControl />;
}
