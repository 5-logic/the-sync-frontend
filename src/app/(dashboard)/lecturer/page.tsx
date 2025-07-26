import { createMetadata } from '@/app/metadata';
import Dashboard from '@/components/features/lecturer/Dashboard';

export const metadata = createMetadata({
	title: 'Lecturer Dashboard',
	description:
		'Lecturer Dashboard for TheSync - Group Formation and Capstone Thesis Development',
});

export default function LecturerDashboardPage() {
	return <Dashboard />;
}
