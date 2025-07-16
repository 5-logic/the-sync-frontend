import { createMetadata } from '@/app/metadata';
import DashboardModerator from '@/components/features/lecturer/DashboardModerator';

export const metadata = createMetadata({
	title: 'Morderator Dashboard',
	description:
		'Morderator Dashboard for TheSync - Group Formation and Capstone Thesis Development',
});

export default function LecturerDashboardPage() {
	return <DashboardModerator />;
}
