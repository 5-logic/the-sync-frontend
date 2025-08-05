"use client";

import { Modal, Typography, Divider } from "antd";

import { SubmissionReviewWithReviewer } from "@/lib/services/reviews.service";
import {
	ReviewerInfo,
	ReviewDates,
	ReviewItemsTable,
	ReviewItemData,
} from "@/components/common/ReviewComponents";
import { AssignedReviewersInfo } from "@/components/common/AssignedReviewersInfo";

const { Text } = Typography;

interface Props {
	readonly open: boolean;
	readonly onClose: () => void;
	readonly review: SubmissionReviewWithReviewer | null;
}

export default function ViewReviewModal({ open, onClose, review }: Props) {
	if (!review) {
		return null;
	}

	const reviewItems: ReviewItemData[] = review.reviewItems.map((item) => ({
		checklistItemId: item.checklistItemId,
		name: item.checklistItem.name,
		description: item.checklistItem.description,
		isRequired: item.checklistItem.isRequired,
		acceptance: item.acceptance,
		note: item.note,
	}));

	return (
		<Modal
			title="Review Details"
			open={open}
			onCancel={onClose}
			width={1200}
			footer={null}
		>
			<Divider />
			<div>
				{/* Review Info */}
				<div style={{ marginBottom: 16 }}>
					<div style={{ marginBottom: 8 }}>
						{/* Show all assigned reviewers if available */}
						{review.assignedReviewers && review.assignedReviewers.length > 0 ? (
							<AssignedReviewersInfo
								review={review}
								label="Assigned Reviewers"
							/>
						) : (
							<ReviewerInfo review={review} label="Reviewer" />
						)}
						<div style={{ marginTop: 8 }}>
							<ReviewDates
								createdAt={review.createdAt}
								updatedAt={review.updatedAt}
							/>
						</div>
					</div>
				</div>

				{/* General Feedback */}
				<div style={{ marginBottom: 24 }}>
					<h4>General Feedback</h4>
					<div
						style={{
							padding: "12px",
							background: "#ffffffff",
							border: "1px solid #f5f5f5",
							borderRadius: "6px",
							minHeight: "80px",
						}}
					>
						<Text>{review.feedback || "No general feedback provided"}</Text>
					</div>
				</div>

				{/* Review Items Table */}
				<div>
					<h4>Review Items</h4>
					<ReviewItemsTable reviewItems={reviewItems} showDescription={true} />
				</div>
			</div>
		</Modal>
	);
}
