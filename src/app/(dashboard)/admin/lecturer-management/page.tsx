import { createMetadata } from '@/app/metadata';
import LecturerManagementClient from '@/components/pages/LecturerManagementClient';

export const metadata = createMetadata({
	title: 'Admin Lecturer Management',
	description:
		'Admin Lecturer Management for TheSync - Group Formation and Capstone Thesis Development',
});

export default function AdminLectureManagementPage() {
	return <LecturerManagementClient />;
}
