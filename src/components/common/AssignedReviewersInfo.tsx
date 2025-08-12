import { Tag, Typography, Space } from "antd";
import { SubmissionReviewWithReviewer } from "@/lib/services/reviews.service";

const { Text } = Typography;

interface AssignedReviewersInfoProps {
	readonly review: SubmissionReviewWithReviewer;
	readonly label?: string;
}

export function AssignedReviewersInfo({
	review,
	label = "Assigned Reviewers",
}: AssignedReviewersInfoProps) {
	const assignedReviewers = review.assignedReviewers || [];

	if (assignedReviewers.length === 0) {
		// Fallback to single reviewer display if no assignedReviewers data
		return (
			<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
				<strong>{label}:</strong>
				<Text strong>{review.lecturer.user.fullName}</Text>
				{review.isMainReviewer === true ? (
					<Tag color="yellow">Main Reviewer</Tag>
				) : (
					<Tag color="blue">Secondary Reviewer</Tag>
				)}
			</div>
		);
	}

	// Sort reviewers to show main reviewer first
	const sortedReviewers = [...assignedReviewers].sort((a, b) => {
		if (a.isMainReviewer && !b.isMainReviewer) return -1;
		if (!a.isMainReviewer && b.isMainReviewer) return 1;
		return 0;
	});

	return (
		<div>
			<div style={{ marginBottom: 8 }}>
				<strong>{label}:</strong>
			</div>
			<Space direction="vertical" size={4}>
				{sortedReviewers.map((assignment) => (
					<div
						key={assignment.reviewerId}
						style={{ display: "flex", alignItems: "center", gap: 8 }}
					>
						<Text strong>{assignment.reviewer.user.fullName}</Text>
						{assignment.isMainReviewer ? (
							<Tag color="yellow">Main Reviewer</Tag>
						) : (
							<Tag color="blue">Secondary Reviewer</Tag>
						)}
					</div>
				))}
			</Space>
		</div>
	);
}
