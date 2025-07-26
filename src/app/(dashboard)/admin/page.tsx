import { createMetadata } from '@/app/metadata';
import Dashboard from '@/components/common/Dashboard';

export const metadata = createMetadata({
	title: 'Admin Dashboard',
	description:
		'Admin Dashboard for TheSync - Group Formation and Capstone Thesis Development',
});

export default function AdminDashboardPage() {
	return <Dashboard />;
}
