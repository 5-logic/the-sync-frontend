"use client";

import {
	Button,
	Divider,
	Input,
	Modal,
	Radio,
	Table,
	Tag,
	Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useEffect, useState } from "react";

import { useReviews } from "@/hooks/lecturer/useReviews";
import {
	SubmissionReview,
	UpdateReviewRequest,
} from "@/lib/services/reviews.service";
import { showNotification } from "@/lib/utils/notification";
import { ChecklistReviewAcceptance } from "@/schemas/_enums";

const { Text } = Typography;

interface Props {
	open: boolean;
	onClose: () => void;
	review: SubmissionReview | null;
	onSuccess?: () => void;
}

interface ReviewItemData {
	checklistItemId: string;
	name: string;
	description: string;
	isRequired: boolean;
	acceptance: ChecklistReviewAcceptance;
	note?: string;
}

const priorityColorMap = {
	Mandatory: "red",
	Optional: "blue",
};

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
			setFeedback(initialFeedback);
			setOriginalFeedback(initialFeedback);

			// Convert review items to editable format
			const items: ReviewItemData[] = review.reviewItems.map((item) => ({
				checklistItemId: item.checklistItemId,
				name: item.checklistItem.name,
				description: item.checklistItem.description,
				isRequired: item.checklistItem.isRequired,
				acceptance: item.acceptance,
				note: item.note,
			}));

			setReviewItems(items);
			setOriginalReviewItems(items);
		}
	}, [review]);

	const handleAcceptanceChange = useCallback(
		(checklistItemId: string, value: ChecklistReviewAcceptance) => {
			setReviewItems((prev) =>
				prev.map((item) => {
					// Only update if the value has actually changed
					if (
						item.checklistItemId === checklistItemId &&
						item.acceptance !== value
					) {
						return { ...item, acceptance: value };
					}
					return item;
				}),
			);
		},
		[],
	);

	const handleNoteChange = useCallback(
		(checklistItemId: string, value: string) => {
			setReviewItems((prev) =>
				prev.map((item) => {
					// Only update if the value has actually changed
					if (item.checklistItemId === checklistItemId && item.note !== value) {
						return { ...item, note: value };
					}
					return item;
				}),
			);
		},
		[],
	);

	const handleFeedbackChange = useCallback((value: string) => {
		setFeedback((prev) => {
			// Only update if the value has actually changed
			if (prev !== value) {
				return value;
			}
			return prev;
		});
	}, []);

	// Clear any potential memory leaks on unmount
	useEffect(() => {
		return () => {
			// Cleanup function - no timers to clear in this simplified version
		};
	}, []);

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
		for (let i = 0; i < reviewItems.length; i++) {
			const current = reviewItems[i];
			const original = originalReviewItems[i];

			if (
				current.acceptance !== original.acceptance ||
				(current.note || "").trim() !== (original.note || "").trim()
			) {
				return true;
			}
		}

		return false;
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
					note: item.note || undefined,
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

			// Extract error message from backend response if available
			let errorMessage =
				"An unexpected error occurred while updating the review";
			let errorDescription =
				"Please try again or contact support if the problem persists";

			if (error instanceof Error) {
				errorMessage = error.message || errorMessage;
				// If the error message contains detailed information, use it as description
				if (error.message && error.message.length > 50) {
					errorDescription = error.message;
					errorMessage = "Update Failed";
				}
			}

			showNotification.error(errorMessage, errorDescription);
		}
	};

	const handleCancel = () => {
		// Reset form data to original values
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
			render: (_value, record) => (
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
			render: (_value, record) => (
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
			render: (_value, record) => {
				const label = record.isRequired ? "Mandatory" : "Optional";
				const color = priorityColorMap[label];
				return <Tag color={color}>{label}</Tag>;
			},
		},
	];

	return (
		<Modal
			title="Edit Review"
			open={open}
			onCancel={submitting ? undefined : handleCancel}
			width={1000}
			closable={!submitting}
			maskClosable={!submitting}
			footer={[
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
			]}
		>
			{review && (
				<div>
					<Divider style={{ margin: "16px 0" }} />
					{/* Review Info */}
					<div style={{ marginBottom: 16 }}>
						<div style={{ marginBottom: 8 }}>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: 8,
									marginTop: 4,
								}}
							>
								<strong>Created by:</strong>
								<Text strong>{review.lecturer.user.fullName}</Text>
								{/* Ensure boolean type check for isMainReviewer */}
								{review.isMainReviewer === true ? (
									<Tag color="yellow">Main Reviewer</Tag>
								) : (
									<Tag color="blue">Secondary Reviewer</Tag>
								)}
							</div>
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
			)}
		</Modal>
	);
}
