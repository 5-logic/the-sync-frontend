import { createMetadata } from '@/app/metadata';
import SuggestedThesis from '@/components/features/student/SuggestedThesis';

export const metadata = createMetadata({
	title: 'Suggested Thesis By AI',
	description: 'AI-recommended thesis topics based on your profile',
});

export default function StudentSuggestedThesisPage() {
	return <SuggestedThesis />;
}
