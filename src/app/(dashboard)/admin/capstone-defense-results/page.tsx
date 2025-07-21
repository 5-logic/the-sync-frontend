import { createMetadata } from '@/app/metadata';
import GroupResults from '@/components/features/admin/CapstoneDefenseResults/GroupResults';

export const metadata = createMetadata({
	title: 'Admin Capstone Defense Results',
	description:
		'Admin Capstone Defense Results for TheSync - Group Formation and Capstone Thesis Development',
});

export default function CapstoneDefenseResultsPage() {
	return <GroupResults />;
}
