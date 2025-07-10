import { createMetadata } from '@/app/metadata';
import LecturerListPublishThesisClient from '@/components/pages/lecturer/LecturerListPublishThesisClient';

export const metadata = createMetadata({
	title: 'Lecturer Assign List Publish Thesis',
	description:
		'Lecturer Assign List Publish Thesis for TheSync - Group Formation and Capstone Thesis Development',
});

export default function LecturerListPublishThesisPage() {
	return <LecturerListPublishThesisClient />;
}
