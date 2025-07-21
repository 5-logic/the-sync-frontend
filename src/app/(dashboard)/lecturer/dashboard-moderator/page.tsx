import { createMetadata } from '@/app/metadata';
import Dashboard from '@/components/common/Dashboard';

export const metadata = createMetadata({
	title: 'Moderator Dashboard',
	description:
		'Moderator Dashboard for TheSync - Group Formation and Capstone Thesis Development',
});

export default function ModeratorDashboardPage() {
	return <Dashboard />;
}
