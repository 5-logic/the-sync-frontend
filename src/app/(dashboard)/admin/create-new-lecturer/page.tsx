import { createMetadata } from '@/app/metadata';
import CreateNewLecturerClient from '@/components/pages/admin/CreateNewLecturerClient';

export const metadata = createMetadata({
	title: 'Admin Create New Lecturer',
	description:
		'Admin Create New Lecturer for TheSync - Group Formation and Capstone Thesis Development',
});
export default function CreateNewLecturerPage() {
	return <CreateNewLecturerClient />;
}
