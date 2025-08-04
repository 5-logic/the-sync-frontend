"use client";

import { EyeOutlined } from "@ant-design/icons";
import { Button, Card, List, Skeleton, Tag, Typography } from "antd";
import { useState } from "react";

import { SubmissionReview } from "@/lib/services/reviews.service";

import ViewReviewModal from "@/components/features/lecturer/GroupProgess/ViewReviewModal";

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

	const handleViewReview = (review: SubmissionReview) => {
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
											Created: {new Date(review.createdAt).toLocaleDateString()}
										</Text>
										{review.updatedAt !== review.createdAt && (
											<>
												<br />
												<Text type="secondary">
													Updated:{" "}
													{new Date(review.updatedAt).toLocaleDateString()}
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
