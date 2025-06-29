import { createMetadata } from '@/app/metadata';
import GroupProgressPage from '@/components/features/lecturer/GroupProgess';

export const metadata = createMetadata({
	title: 'Lecturer Group Progress',
	description:
		'Lecturer Group Progress for TheSync - Group Formation and Capstone Thesis Development',
});

export default function LecturerGroupProgressPage() {
	return <GroupProgressPage />;
}
