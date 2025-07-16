import { createMetadata } from '@/app/metadata';
import DashboardModerator from '@/components/features/lecturer/DashboardModerator';

export const metadata = createMetadata({
	title: 'Moderator Dashboard',
	description:
		'Moderator Dashboard for TheSync - Group Formation and Capstone Thesis Development',
});

export default function ModeratorDashboardPage() {
	return <DashboardModerator />;
}
