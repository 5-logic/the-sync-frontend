import { createMetadata } from '@/app/metadata';
import StudentFirstLoginDashboard from '@/components/features/student/FirstLoginDashboard';

export const metadata = createMetadata({
	title: 'Student First Login Dashboard',
	description:
		'Welcome to TheSync! Form or join a group to start your capstone journey.',
});

export default function StudentFirstLoginDashboardPage() {
	return <StudentFirstLoginDashboard />;
}
