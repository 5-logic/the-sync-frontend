import { createMetadata } from '@/app/metadata';
import ViewThesisDetail from '@/components/features/lecturer/ViewThesisDetail';

export const metadata = createMetadata({
	title: 'Lecturer View Thesis Detail',
	description:
		'Lecturer View Thesis Detail for TheSync - Group Formation and Capstone Thesis Development',
});

export default function LecturerViewTopicDetailPage() {
	return <ViewThesisDetail />;
}
