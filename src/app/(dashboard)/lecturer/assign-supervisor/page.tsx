import { createMetadata } from '@/app/metadata';
import LecturerAssignSupervisorClient from '@/components/pages/lecturer/LecturerAssignSupervisorClient';

export const metadata = createMetadata({
	title: 'Lecturer Assign Supervisor',
	description:
		'Lecturer Assign Supervisor for TheSync - Group Formation and Capstone Thesis Development',
});

export default function LecturerAssignSupervisorPage() {
	return <LecturerAssignSupervisorClient />;
}
