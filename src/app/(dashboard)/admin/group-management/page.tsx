import { createMetadata } from '@/app/metadata';
import GroupManagement from '@/components/features/admin/GroupManagement';

export const metadata = createMetadata({
	title: 'Admin Group Management',
	description:
		'Admin Group Management for TheSync - Group Formation and Capstone Thesis Development',
});

export default function AdminGroupManagementPage() {
	return <GroupManagement />;
}
