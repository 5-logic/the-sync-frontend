import { createMetadata } from '@/app/metadata';
import GroupDashboardPageClient from '@/components/pages/student/GroupDashboardPageClient';

export const metadata = createMetadata({
	title: 'Group Dashboard',
	description:
		'Group Dashboard for TheSync - View your group information, members, and thesis progress',
});

export default function StudentGroupDashboardPage() {
	return <GroupDashboardPageClient />;
}
