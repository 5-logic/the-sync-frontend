import { createMetadata } from '@/app/metadata';
import EditThesis from '@/components/features/lecturer/EditThesis';

export const metadata = createMetadata({
	title: 'Lecturer Edit Thesis',
	description:
		'Lecturer Edit Thesis for TheSync - Group Formation and Capstone Thesis Development',
});

export default function LecturerThesisEditPage() {
	return <EditThesis />;
}
