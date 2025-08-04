"use client";

import {
	Button,
	Divider,
	Input,
	Modal,
	Radio,
	Table,
	Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useEffect, useState } from "react";

import { useReviews } from "@/hooks/lecturer/useReviews";
import {
	SubmissionReview,
	UpdateReviewRequest,
} from "@/lib/services/reviews.service";
import { showNotification } from "@/lib/utils/notification";
import { getPriorityConfig } from "@/lib/utils/uiConstants";
import { ChecklistReviewAcceptance } from "@/schemas/_enums";
import { ReviewerInfo, ReviewDates } from "@/components/common/ReviewComponents";

interface Props {
	readonly open: boolean;
	readonly onClose: () => void;
	readonly review: SubmissionReview | null;
	readonly onSuccess?: () => void;
}

interface ReviewItemData {
	readonly checklistItemId: string;
	readonly name: string;
	readonly description: string;
	readonly isRequired: boolean;
	acceptance: ChecklistReviewAcceptance;
	note?: string;
}

export default function EditReviewModal({
	open,
	onClose,
	review,
	onSuccess,
}: Props) {
	const { updateReview, submitting } = useReviews();

	const [feedback, setFeedback] = useState<string>("");
	const [reviewItems, setReviewItems] = useState<ReviewItemData[]>([]);
	const [originalFeedback, setOriginalFeedback] = useState<string>("");
	const [originalReviewItems, setOriginalReviewItems] = useState<
		ReviewItemData[]
	>([]);

	// Initialize data when review changes
	useEffect(() => {
		if (review) {
			const initialFeedback = review.feedback || "";
			const items: ReviewItemData[] = review.reviewItems.map((item) => ({
				checklistItemId: item.checklistItemId,
				name: item.checklistItem.name,
				description: item.checklistItem.description,
				isRequired: item.checklistItem.isRequired,
				acceptance: item.acceptance,
				note: item.note,
			}));

			setFeedback(initialFeedback);
			setOriginalFeedback(initialFeedback);
			setReviewItems(items);
			setOriginalReviewItems([...items]);
		}
	}, [review]);

	// Reset state when modal closes
	useEffect(() => {
		if (!open && review) {
			setFeedback(originalFeedback);
			setReviewItems([...originalReviewItems]);
		}
	}, [open, originalFeedback, originalReviewItems, review]);

	const handleAcceptanceChange = useCallback(
		(checklistItemId: string, value: ChecklistReviewAcceptance) => {
			setReviewItems((prevItems) =>
				prevItems.map((item) =>
					item.checklistItemId === checklistItemId
						? { ...item, acceptance: value }
						: item,
				),
			);
		},
		[],
	);

	const handleNoteChange = useCallback(
		(checklistItemId: string, value: string) => {
			setReviewItems((prevItems) =>
				prevItems.map((item) =>
					item.checklistItemId === checklistItemId
						? { ...item, note: value }
						: item,
				),
			);
		},
		[],
	);

	const handleFeedbackChange = useCallback((value: string) => {
		setFeedback(value);
	}, []);

	// Remove unnecessary cleanup effect
	// Check if there are any changes made to the review
	const hasChanges = useCallback(() => {
		// Check feedback changes
		if (feedback.trim() !== originalFeedback.trim()) {
			return true;
		}

		// Check review items changes
		if (reviewItems.length !== originalReviewItems.length) {
			return true;
		}

		// Check each review item for changes
		return reviewItems.some((current, index) => {
			const original = originalReviewItems[index];
			if (!original) return true;

			return (
				current.acceptance !== original.acceptance ||
				(current.note || "").trim() !== (original.note || "").trim()
			);
		});
	}, [feedback, originalFeedback, reviewItems, originalReviewItems]);

	const handleSave = async () => {
		if (!review) {
			showNotification.error(
				"No Review Data",
				"Review data is not available for editing",
			);
			return;
		}

		try {
			const updateData: UpdateReviewRequest = {
				feedback: feedback.trim(),
				reviewItems: reviewItems.map((item) => ({
					checklistItemId: item.checklistItemId,
					acceptance: item.acceptance,
					note: item.note?.trim() || undefined,
				})),
			};

			const result = await updateReview(review.id, updateData);

			if (result) {
				showNotification.success(
					"Review Updated",
					"The review has been successfully updated",
				);
				onSuccess?.();
				onClose();
			} else {
				showNotification.error(
					"Update Failed",
					"Failed to update the review. Please try again.",
				);
			}
		} catch (error) {
			console.error("Error updating review:", error);

			const errorMessage =
				error instanceof Error
					? error.message
					: "An unexpected error occurred while updating the review";

			showNotification.error("Update Failed", errorMessage);
		}
	};

	const handleCancel = () => {
		// Reset form data to original values when canceling
		if (review) {
			setFeedback(originalFeedback);
			setReviewItems([...originalReviewItems]);
		}
		onClose();
	};

	const columns: ColumnsType<ReviewItemData> = [
		{
			title: "Question",
			dataIndex: "name",
			key: "name",
		},
		{
			title: "Response",
			key: "response",
			render: (_, record) => (
				<Radio.Group
					value={record.acceptance}
					onChange={(e) =>
						handleAcceptanceChange(record.checklistItemId, e.target.value)
					}
				>
					<Radio value="Yes">Yes</Radio>
					<Radio value="No">No</Radio>
					<Radio value="NotAvailable">N/A</Radio>
				</Radio.Group>
			),
		},
		{
			title: "Notes",
			key: "notes",
			render: (_, record) => (
				<Input
					placeholder="Add notes..."
					value={record.note}
					onChange={(e) =>
						handleNoteChange(record.checklistItemId, e.target.value)
					}
				/>
			),
		},
		{
			title: "Priority",
			key: "priority",
			align: "center",
			render: (_, record) => {
				const { label, color } = getPriorityConfig(record.isRequired);
				return <Tag color={color}>{label}</Tag>;
			},
		},
	];

	const modalFooter = [
		<Button key="cancel" onClick={handleCancel} disabled={submitting}>
			Cancel
		</Button>,
		<Button
			key="save"
			type="primary"
			onClick={handleSave}
			loading={submitting}
			disabled={!hasChanges() || submitting}
		>
			Save Changes
		</Button>,
	];

	if (!review) {
		return null;
	}

	return (
		<Modal
			title="Edit Review"
			open={open}
			onCancel={submitting ? undefined : handleCancel}
			width={1000}
			closable={!submitting}
			maskClosable={!submitting}
			footer={modalFooter}
		>
			<div>
				<Divider style={{ margin: "16px 0" }} />

				{/* Review Info */}
				<div style={{ marginBottom: 16 }}>
					<div style={{ marginBottom: 8 }}>
						<ReviewerInfo review={review} label="Created by" />
						<div style={{ marginTop: 8 }}>
							<ReviewDates
								createdAt={review.createdAt}
								updatedAt={review.updatedAt}
							/>
						</div>
					</div>
				</div>

				{/* Feedback section */}
				<div style={{ marginBottom: 24 }}>
					<h4>General Feedback</h4>
					<Input.TextArea
						placeholder="Enter your general feedback for this submission..."
						value={feedback}
						onChange={(e) => handleFeedbackChange(e.target.value)}
						rows={4}
					/>
				</div>

				{/* Review Items Table */}
				<div>
					<Table
						rowKey="checklistItemId"
						dataSource={reviewItems}
						columns={columns}
						pagination={false}
						size="small"
					/>
				</div>
			</div>
		</Modal>
	);
}
