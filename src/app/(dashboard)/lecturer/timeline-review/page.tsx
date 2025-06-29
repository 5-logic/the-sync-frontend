import { createMetadata } from '@/app/metadata';
import TimelineReview from '@/components/features/lecturer/TimelineReview';

export const metadata = createMetadata({
	title: 'Lecturer Timeline Review',
	description:
		'Lecturer Timeline Review for TheSync - Group Formation and Capstone Thesis Development',
});
export default function TimelineReviewPage() {
	return <TimelineReview />;
}
