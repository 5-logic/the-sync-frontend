import { createMetadata } from '@/app/metadata';
import ViewThesisDetail from '@/components/features/lecturer/ViewThesisDetail';

export const metadata = createMetadata({
	title: 'Lecturer Publish Thesis Detail',
	description:
		'Lecturer Publish Thesis Detail for TheSync - Group Formation and Capstone Thesis Development',
});

export default function PublishThesisDetailPage() {
	return <ViewThesisDetail mode="publish-list" />;
}
