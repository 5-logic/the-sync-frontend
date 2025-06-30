import { createMetadata } from '@/app/metadata';
import CreateThesis from '@/components/features/lecturer/CreateThesis';

export const metadata = createMetadata({
	title: 'Lecturer Create Thesis',
	description:
		'Lecturer Create Thesis for TheSync - Group Formation and Capstone Thesis Development',
});

export default function LecturerThesisCreatePage() {
	return <CreateThesis />;
}
