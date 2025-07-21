import { createMetadata } from '@/app/metadata';
import CapstoneDefenseResults from '@/components/features/admin/CapstoneDefenseResults';

export const metadata = createMetadata({
	title: 'Admin Capstone Project Management',
	description:
		'Admin Capstone Project Management for TheSync - Group Formation and Capstone Thesis Development',
});

export default function CapstoneDefenseResultsPage() {
	return <CapstoneDefenseResults />;
}
