import { createMetadata } from '@/app/metadata';
import FormOrJoinGroupPageClient from '@/components/pages/student/FormOrJoinGroupPageClient';

export const metadata = createMetadata({
	title: 'Form or Join Group',
	description:
		'Form or Join Group for TheSync - Group Formation and Capstone Thesis Development',
});

export default function StudentFormOrJoinGroupPage() {
	return <FormOrJoinGroupPageClient />;
}
