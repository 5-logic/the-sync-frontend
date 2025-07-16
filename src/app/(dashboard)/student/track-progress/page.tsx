import { createMetadata } from '@/app/metadata';
import TrackProgress from '@/components/features/student/TrackProgress';

export const metadata = createMetadata({
	title: 'Track Progress',
	description: 'Monitor your thesis project progress and milestones',
});

export default function StudentTrackProgressPage() {
	return <TrackProgress />;
}
