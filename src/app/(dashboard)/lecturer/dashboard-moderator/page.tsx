import { createMetadata } from '@/app/metadata';
import LecturerModeratorDashboardClient from '@/components/pages/lecturer/LecturerModeratorDashboardClient';

export const metadata = createMetadata({
	title: 'Moderator Dashboard',
	description:
		'Moderator Dashboard for TheSync - Group Formation and Capstone Thesis Development',
});

export default function ModeratorDashboardPage() {
	return <LecturerModeratorDashboardClient />;
}
