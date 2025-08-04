"use client";

import { EyeOutlined } from "@ant-design/icons";
import { Button, Card, List, Skeleton } from "antd";
import { useState } from "react";

import { SubmissionReviewWithReviewer } from "@/lib/services/reviews.service";
import {
	ReviewerInfo,
	ReviewDates,
} from "@/components/common/ReviewComponents";

import ViewReviewModal from "@/components/features/lecturer/GroupProgess/ViewReviewModal";

interface Props {
	readonly reviews: SubmissionReviewWithReviewer[];
	readonly loading?: boolean;
}

export default function ExistingReviewsList({ reviews, loading }: Props) {
	const [viewingReview, setViewingReview] =
		useState<SubmissionReviewWithReviewer | null>(null);
	const [viewModalOpen, setViewModalOpen] = useState(false);

	const handleViewReview = (review: SubmissionReviewWithReviewer) => {
		setViewingReview(review);
		setViewModalOpen(true);
	};

	const handleViewClose = () => {
		setViewModalOpen(false);
		setViewingReview(null);
	};

	// Don't render anything if there are no reviews and not loading
	if (reviews.length === 0 && !loading) {
		return null;
	}

	// Render skeleton loading state
	if (loading) {
		return (
			<Card size="small">
				<Skeleton active avatar={false} paragraph={{ rows: 2 }} />
			</Card>
		);
	}

	return (
		<>
			<Card title="Existing Reviews" size="small">
				<List
					dataSource={reviews}
					renderItem={(review) => (
						<List.Item
							actions={[
								<Button
									key="view"
									type="link"
									icon={<EyeOutlined />}
									onClick={() => handleViewReview(review)}
								/>,
							]}
						>
							<List.Item.Meta
								title={<ReviewerInfo review={review} label="Reviewed by" />}
								description={
									<ReviewDates
										createdAt={review.createdAt}
										updatedAt={review.updatedAt}
									/>
								}
							/>
						</List.Item>
					)}
				/>
			</Card>

			<ViewReviewModal
				open={viewModalOpen}
				onClose={handleViewClose}
				review={viewingReview}
			/>
		</>
	);
}
