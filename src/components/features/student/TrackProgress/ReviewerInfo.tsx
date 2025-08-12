import React from "react";
import { Avatar, Spin, Typography, Space } from "antd";
import { UserOutlined } from "@ant-design/icons";

import { SubmissionReviewsResponse } from "@/lib/services/reviews.service";

const { Text } = Typography;

type AssignedReviewer = SubmissionReviewsResponse["assignmentReviews"][0];

interface ReviewerInfoProps {
	reviewersData: AssignedReviewer[] | null;
	loading: boolean;
	error: string | null;
}

const ReviewerInfo: React.FC<ReviewerInfoProps> = ({
	reviewersData,
	loading,
	error,
}) => {
	if (loading) {
		return (
			<div className="flex items-center gap-2 py-2">
				<Spin size="small" />
				<Text type="secondary">Loading reviewer information...</Text>
			</div>
		);
	}

	if (error) {
		return (
			<div className="py-2">
				<Text type="danger" className="text-sm">
					Failed to load reviewer information
				</Text>
			</div>
		);
	}

	if (!reviewersData || reviewersData.length === 0) {
		return (
			<div className="py-3 border-t border-gray-100">
				<div className="flex items-center gap-2">
					<Text type="secondary" className="text-sm">
						👤 No reviewers assigned yet
					</Text>
				</div>
			</div>
		);
	}

	const assignedReviewers = reviewersData;

	return (
		<div className="py-3 border-t border-gray-100">
			<div className="mb-2">
				<Text strong className="text-sm text-gray-700">
					👤 Assigned Reviewers
				</Text>
				<Text type="secondary" className="text-xs ml-2">
					({assignedReviewers.length} reviewer
					{assignedReviewers.length > 1 ? "s" : ""})
				</Text>
			</div>
			<Space direction="vertical" size="small" className="w-full">
				{assignedReviewers.map((assignment: AssignedReviewer) => (
					<div
						key={assignment.reviewerId}
						className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg"
					>
						<Avatar size="small" icon={<UserOutlined />} />
						<div className="flex-1">
							<Text className="font-medium text-sm">
								{assignment.reviewer.user.fullName}
								{assignment.isMainReviewer && (
									<Text type="secondary" className="text-xs ml-2">
										(Main Reviewer)
									</Text>
								)}
							</Text>
							<br />
							<Text type="secondary" className="text-xs">
								{assignment.reviewer.user.email}
							</Text>
						</div>
					</div>
				))}
			</Space>
		</div>
	);
};

export default ReviewerInfo;
