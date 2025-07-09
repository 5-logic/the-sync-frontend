import { createMetadata } from '@/app/metadata';
import GroupReview from '@/components/features/lecturer/GroupReview';

export const metadata = createMetadata({
	title: 'Lecturer Group Review',
	description:
		'Lecturer Group Review for TheSync - Group Formation and Capstone Thesis Development',
});

export default function LecturerAssignListPublicThesisPage() {
	return <GroupReview />;
}
