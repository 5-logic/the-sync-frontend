import { createMetadata } from '@/app/metadata';
import AdminAssignStudentsDetailPage from '@/components/features/admin/AssignStudentDetail';

export const metadata = createMetadata({
	title: 'Admin Assign Student Detail',
	description:
		'Admin Assign Student Detail for TheSync - Group Formation and Capstone Thesis Development',
});

export default function AdminAssignStudentDetailPage() {
	return <AdminAssignStudentsDetailPage />;
}
