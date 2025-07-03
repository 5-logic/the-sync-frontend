import { createMetadata } from '@/app/metadata';
import AssignListPublishThesisPage from '@/components/features/lecturer/AssignListPublishThesis';

export const metadata = createMetadata({
	title: 'Lecturer Assign List Publish Thesis',
	description:
		'Lecturer Assign List Publish Thesis for TheSync - Group Formation and Capstone Thesis Development',
});

export default function LecturerAssignListPublishThesisPage() {
	return <AssignListPublishThesisPage />;
}
