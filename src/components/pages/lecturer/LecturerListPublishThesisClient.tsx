'use client';

import AssignListPublishThesisPage from '@/components/features/lecturer/AssignListPublishThesis';
import { useModeratorAuth } from '@/hooks/auth';

export default function LecturerListPublishThesisClient() {
	const { isAuthorized } = useModeratorAuth();

	if (!isAuthorized) {
		return null; // Will redirect to unauthorized page
	}

	return <AssignListPublishThesisPage />;
}
