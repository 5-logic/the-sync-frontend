"use client";

import { EyeOutlined } from "@ant-design/icons";
import { Button, Card, List, Tag, Typography } from "antd";
import { useEffect, useState } from "react";

import { SubmissionReview } from "@/lib/services/reviews.service";

import ViewReviewModal from "./ViewReviewModal";

const { Text } = Typography;

interface Props {
	readonly reviews: SubmissionReview[];
	readonly loading?: boolean;
}

export default function ExistingReviewsList({ reviews, loading }: Props) {
	const [viewingReview, setViewingReview] = useState<SubmissionReview | null>(
		null,
	);
	const [viewModalOpen, setViewModalOpen] = useState(false);

	// Debug: Log reviews data to check isMainReviewer values
	useEffect(() => {
		if (reviews.length > 0) {
			console.log("🔍 ExistingReviewsList - Review data check:");
			reviews.forEach((review, index) => {
				console.log(`Review ${index + 1}:`, {
					id: review.id,
					lecturerName: review.lecturer.user.fullName,
					isMainReviewer: review.isMainReviewer,
					isMainReviewerType: typeof review.isMainReviewer,
				});
			});
		}
	}, [reviews]);

	const handleViewReview = (review: SubmissionReview) => {
		setViewingReview(review);
		setViewModalOpen(true);
	};

	const handleViewClose = () => {
		setViewModalOpen(false);
		setViewingReview(null);
	};

	// Don't render anything if there are no reviews
	if (reviews.length === 0) {
		return null;
	}

	return (
		<>
			<Card title="Existing Reviews" size="small">
				<List
					loading={loading}
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
								title={
									<div
										style={{ display: "flex", alignItems: "center", gap: 8 }}
									>
										<strong>Reviewed by:</strong>
										<Text strong>{review.lecturer.user.fullName}</Text>
										{/* Ensure boolean type check for isMainReviewer */}
										{review.isMainReviewer === true ? (
											<Tag color="yellow">Main Reviewer</Tag>
										) : (
											<Tag color="blue">Secondary Reviewer</Tag>
										)}
									</div>
								}
								description={
									<div>
										<Text type="secondary">
											Created: {new Date(review.createdAt).toLocaleString()}
										</Text>
										{review.updatedAt !== review.createdAt && (
											<>
												<br />
												<Text type="secondary">
													Updated: {new Date(review.updatedAt).toLocaleString()}
												</Text>
											</>
										)}
									</div>
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
