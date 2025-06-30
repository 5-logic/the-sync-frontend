import { createMetadata } from '@/app/metadata';
import AssignListPublicThesisPage from '@/components/features/lecturer/AssignListPublicThesis';

export const metadata = createMetadata({
	title: 'Lecturer Assign List Public Thesis',
	description:
		'Lecturer Assign List Public Thesis for TheSync - Group Formation and Capstone Thesis Development',
});

export default function LecturerAssignListPublicThesisPage() {
	return <AssignListPublicThesisPage />;
}
