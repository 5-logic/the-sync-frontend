import { createMetadata } from '@/app/metadata';
import CapstoneProjectManagement from '@/components/features/admin/CapstoneProjectManagement';

export const metadata = createMetadata({
	title: 'Admin Capstone Project Management',
	description:
		'Admin Capstone Project Management for TheSync - Group Formation and Capstone Thesis Development',
});

export default function CapstoneProjectManagementPage() {
	return <CapstoneProjectManagement />;
}
