'use client';

import { Typography } from 'antd';

import { useModeratorAuth } from '@/hooks/auth';

const { Title } = Typography;

export default function LecturerAssignLecturerReviewClient() {
	const { isAuthorized } = useModeratorAuth();

	if (!isAuthorized) {
		return null; // Will redirect to unauthorized page
	}

	return (
		<div className="p-6">
			<Title level={2}>👨‍🏫 Assign Lecturer Review</Title>
		</div>
	);
}
