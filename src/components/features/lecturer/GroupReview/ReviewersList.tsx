import { UserOutlined } from '@ant-design/icons';
import { Space, Tag, Typography } from 'antd';
import React from 'react';

import { AssignmentReviewer } from '@/lib/services/reviews.service';

const { Text } = Typography;

interface ReviewersListProps {
	assignmentReviews: AssignmentReviewer[];
}

export default function ReviewersList({
	assignmentReviews,
}: ReviewersListProps) {
	if (!assignmentReviews || assignmentReviews.length === 0) {
		return (
			<Text type="secondary" italic>
				No reviewers assigned
			</Text>
		);
	}

	// Sort reviewers: Main reviewers first, then secondary reviewers
	const sortedReviewers = [...assignmentReviews].sort((a, b) => {
		if (a.isMainReviewer && !b.isMainReviewer) return -1;
		if (!a.isMainReviewer && b.isMainReviewer) return 1;
		return 0;
	});

	return (
		<Space direction="vertical" size="small" style={{ width: '100%' }}>
			<Text strong style={{ fontSize: '14px' }}>
				<UserOutlined style={{ marginRight: 4 }} />
				Assigned Reviewers:
			</Text>
			<Space direction="vertical" size="small">
				{sortedReviewers.map((reviewer) => (
					<div
						key={reviewer.reviewerId}
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: 8,
						}}
					>
						<Text strong>{reviewer.reviewer.user.fullName}</Text>
						{/* Ensure boolean type check for isMainReviewer */}
						{reviewer.isMainReviewer === true ? (
							<Tag color="yellow">Main Reviewer</Tag>
						) : (
							<Tag color="blue">Secondary Reviewer</Tag>
						)}
					</div>
				))}
			</Space>
		</Space>
	);
}
