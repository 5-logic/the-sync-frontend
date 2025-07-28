import { createMetadata } from '@/app/metadata';
import LecturerGroupManagementClient from '@/components/pages/lecturer/LecturerGroupManagementClient';

export const metadata = createMetadata({
	title: 'Lecturer Group Management',
	description:
		'Lecturer Group Management for TheSync - Group Formation and Capstone Thesis Development',
});

export default function LecturerGroupManagementPage() {
	return <LecturerGroupManagementClient />;
}
