'use client';

import { EditOutlined } from '@ant-design/icons';
import { Button, Card, List } from 'antd';
import { useEffect, useState } from 'react';

import { AssignedReviewersInfo } from '@/components/common/AssignedReviewersInfo';
import {
	ReviewDates,
	ReviewerInfo,
} from '@/components/common/ReviewComponents';
import { SubmissionReviewWithReviewer } from '@/lib/services/reviews.service';

import EditReviewModal from './EditReviewModal';

interface Props {
	readonly reviews: SubmissionReviewWithReviewer[];
	readonly loading?: boolean;
	readonly onReviewUpdated?: () => void;
}

export default function ExistingReviewsList({
	reviews,
	loading,
	onReviewUpdated,
}: Props) {
	const [editingReview, setEditingReview] =
		useState<SubmissionReviewWithReviewer | null>(null);
	const [editModalOpen, setEditModalOpen] = useState(false);

	// Debug: Log reviews data to check isMainReviewer values
	useEffect(() => {
		if (reviews.length > 0) {
			console.log('🔍 ExistingReviewsList - Review data check:');
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

	const handleEditReview = (review: SubmissionReviewWithReviewer) => {
		setEditingReview(review);
		setEditModalOpen(true);
	};

	const handleEditClose = () => {
		setEditModalOpen(false);
		setEditingReview(null);
	};

	const handleEditSuccess = () => {
		onReviewUpdated?.();
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
									key="edit"
									type="link"
									icon={<EditOutlined />}
									onClick={() => handleEditReview(review)}
								/>,
							]}
						>
							<List.Item.Meta
								title={
									/* Show all assigned reviewers if available, otherwise show single reviewer */
									review.assignedReviewers &&
									review.assignedReviewers.length > 0 ? (
										<AssignedReviewersInfo review={review} label="Created by" />
									) : (
										<ReviewerInfo review={review} label="Created by" />
									)
								}
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

			<EditReviewModal
				open={editModalOpen}
				onClose={handleEditClose}
				review={editingReview}
				onSuccess={handleEditSuccess}
			/>
		</>
	);
}
