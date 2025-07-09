import { createMetadata } from '@/app/metadata';
import ViewThesisDetail from '@/components/features/student/ViewThesisDetail';

export const metadata = createMetadata({
	title: 'Student View Thesis Detail',
	description:
		'Student View Thesis Detail for TheSync - Group Formation and Capstone Thesis Development',
});

export default function StudentViewThesisDetailPage() {
	return <ViewThesisDetail />;
}
