import { createMetadata } from '@/app/metadata';
import AssignSupervisors from '@/components/features/lecturer/AssignSupervisor';

export const metadata = createMetadata({
	title: 'Lecturer Assign Supervisor',
	description:
		'Lecturer Assign Supervisor for TheSync - Group Formation and Capstone Thesis Development',
});

export default function LecturerAssignSupervisorPage() {
	return <AssignSupervisors />;
}
