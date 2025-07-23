import { createMetadata } from '@/app/metadata';
import TrackProgressPageClient from '@/components/pages/student/TrackProgressPageClient';

export const metadata = createMetadata({
	title: 'Track Progress',
	description: 'Monitor your thesis project progress and milestones',
});

export default function StudentTrackProgressPage() {
	return <TrackProgressPageClient />;
}
