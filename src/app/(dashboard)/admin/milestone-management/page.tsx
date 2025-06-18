import { createMetadata } from '@/app/metadata';
import MilestoneManagementClient from '@/components/pages/admin/MilestoneManagementClient';

export const metadata = createMetadata({
	title: 'Admin Milestone Management',
	description:
		'Admin Milestone Management for TheSync - Group Formation and Capstone Thesis Development',
});

export default function AdminMilestoneManagementPage() {
	return <MilestoneManagementClient />;
}
