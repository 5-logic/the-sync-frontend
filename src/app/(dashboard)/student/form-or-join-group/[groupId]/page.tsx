import { Metadata } from 'next';

import GroupDetailClient from '@/components/pages/student/GroupDetailClient';

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: 'Group Details | TheSync',
		description:
			'View detailed information about the group including members, skills, responsibilities and project direction.',
	};
}

interface GroupDetailPageProps {
	params: {
		groupId: string;
	};
}

export default function GroupDetailPage({ params }: GroupDetailPageProps) {
	return <GroupDetailClient groupId={params.groupId} />;
}
