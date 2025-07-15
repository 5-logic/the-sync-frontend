'use client';

import { Typography } from 'antd';

import { AuthLoadingSkeleton } from '@/components/common/loading';
import { useModeratorAuth } from '@/hooks/auth';

const { Title } = Typography;

export default function LecturerAssignLecturerReviewClient() {
	const { isAuthorized, loading } = useModeratorAuth();

	// Show loading skeleton while checking authorization
	if (loading) {
		return <AuthLoadingSkeleton />;
	}

	// If not authorized, return null (will redirect to unauthorized page)
	if (!isAuthorized) {
		return null;
	}

	return (
		<div className="p-6">
			<Title level={2}>👨‍🏫 Assign Lecturer Review</Title>
		</div>
	);
}
