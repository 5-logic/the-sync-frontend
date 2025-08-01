"use client";

import { DownloadOutlined } from "@ant-design/icons";
import {
	Button,
	Input,
	Radio,
	Row,
	Skeleton,
	Space,
	Table,
	Tag,
	Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";

import { useReviews } from "@/hooks/lecturer/useReviews";
import { showNotification } from "@/lib/utils/notification";
import { ChecklistReviewAcceptance } from "@/schemas/_enums";

import ExistingReviewsList from "./ExistingReviewsList";

const { Text } = Typography;

interface Props {
	readonly submissionId: string;
	readonly isMainReviewer: boolean;
	readonly onSubmitSuccess?: () => void;
}

interface ChecklistResponse {
	response?: ChecklistReviewAcceptance;
	notes?: string;
}

interface ChecklistItemWithResponse {
	id: string;
	name: string;
	description: string;
	isRequired: boolean;
	checklistId: string;
	createdAt: string;
	updatedAt: string;
	response?: ChecklistReviewAcceptance;
	notes?: string;
}

interface ChecklistResponse {
	response?: ChecklistReviewAcceptance;
	notes?: string;
}

const priorityColorMap = {
	Mandatory: "red",
	Optional: "blue",
};

/**
 * Extract filename from URL
 * @param url - The URL string
 * @returns The filename or fallback text
 */
const getFileNameFromUrl = (url: string): string => {
	try {
		const urlParts = url.split("/");
		const fileName = urlParts[urlParts.length - 1];
		// Decode URI component to handle encoded characters
		return decodeURIComponent(fileName) || "Document";
	} catch {
		return "Document";
	}
};

export default function ReviewChecklistTable({
	submissionId,
	isMainReviewer,
	onSubmitSuccess,
}: Props) {
	const {
		reviewForm,
		submissionReviews,
		reviewFormLoading,
		submissionReviewsLoading,
		submitting,
		error,
		fetchReviewForm,
		fetchSubmissionReviews,
		submitReview,
	} = useReviews();

	const [answers, setAnswers] = useState<Record<string, ChecklistResponse>>({});
	const [feedback, setFeedback] = useState<string>("");
	const [showValidationErrors, setShowValidationErrors] = useState(false);

	// Fetch review form data when component mounts or submissionId changes
	useEffect(() => {
		if (submissionId) {
			fetchReviewForm(submissionId);
			fetchSubmissionReviews(submissionId);
		}
	}, [submissionId, fetchReviewForm, fetchSubmissionReviews]);

	// Clear form data if there are existing reviews
	useEffect(() => {
		if (submissionReviews.length > 0) {
			setAnswers({});
			setFeedback("");
		}
	}, [submissionReviews]);

	// Get checklist items from the review form
	const checklistItems: ChecklistItemWithResponse[] = useMemo(() => {
		if (!reviewForm?.milestone?.checklist?.checklistItems) {
			return [];
		}

		return reviewForm.milestone.checklist.checklistItems.map((item) => ({
			...item,
			response: answers[item.id]?.response,
			notes: answers[item.id]?.notes,
		}));
	}, [reviewForm, answers]);

	// Validation helper functions
	const getValidationStatus = useMemo(() => {
		const mandatoryItems = checklistItems.filter((item) => item.isRequired);
		const unansweredMandatory = mandatoryItems.filter(
			(item) => !answers[item.id]?.response,
		);
		const answeredItems = Object.entries(answers).filter(
			([, response]) => response.response,
		);
		const hasFeedback = feedback.trim().length > 0;

		return {
			mandatoryAnswered: unansweredMandatory.length === 0,
			hasAnswers: answeredItems.length > 0,
			hasFeedback,
			unansweredMandatoryCount: unansweredMandatory.length,
			totalMandatory: mandatoryItems.length,
			isValid:
				unansweredMandatory.length === 0 &&
				answeredItems.length > 0 &&
				hasFeedback,
		};
	}, [checklistItems, answers, feedback]);

	const handleResponseChange = (
		id: string,
		value: ChecklistReviewAcceptance,
	) => {
		setAnswers((prev) => ({
			...prev,
			[id]: { ...prev[id], response: value },
		}));
	};

	const handleNotesChange = (id: string, value: string) => {
		setAnswers((prev) => ({
			...prev,
			[id]: { ...prev[id], notes: value },
		}));
	};

	const handleSaveChecklist = async () => {
		if (!reviewForm?.milestone?.checklist?.id) {
			showNotification.error(
				"Missing Data",
				"Checklist data is not available for review submission",
			);
			return;
		}

		// Check if there are already existing reviews
		if (submissionReviews.length > 0) {
			showNotification.error(
				"Review Already Exists",
				"A review already exists for this submission. Please edit the existing review instead.",
			);
			return;
		}

		// Reset validation errors display
		setShowValidationErrors(false);

		// Validation: Check if feedback is provided
		if (!feedback.trim()) {
			setShowValidationErrors(true);
			showNotification.error(
				"Missing Feedback",
				"Please provide general feedback before submitting your review",
			);
			return;
		}

		// Validation: Check if all mandatory questions are answered
		const mandatoryItems = checklistItems.filter((item) => item.isRequired);
		const unansweredMandatory = mandatoryItems.filter(
			(item) => !answers[item.id]?.response,
		);

		if (unansweredMandatory.length > 0) {
			setShowValidationErrors(true);
			showNotification.error(
				"Incomplete Required Questions",
				`Please answer all mandatory questions. ${unansweredMandatory.length} mandatory question(s) remaining.`,
			);
			return;
		}

		// Validation: Check if at least some questions are answered
		const answeredItems = Object.entries(answers).filter(
			([, response]) => response.response,
		);
		if (answeredItems.length === 0) {
			setShowValidationErrors(true);
			showNotification.error(
				"No Responses Provided",
				"Please answer at least one checklist question before submitting",
			);
			return;
		}

		try {
			// Prepare review items
			const reviewItems = Object.entries(answers)
				.filter(([, response]) => response.response) // Only include items with responses
				.map(([checklistItemId, response]) => ({
					checklistItemId,
					acceptance: response.response!,
					note: response.notes || "",
				}));

			const reviewData = {
				checklistId: reviewForm.milestone.checklist.id,
				feedback: feedback.trim(),
				reviewItems,
			};

			const result = await submitReview(submissionId, reviewData);

			if (result) {
				showNotification.success(
					"Review Submitted",
					"Your review has been submitted successfully!",
				);
				// Clear validation errors on success
				setShowValidationErrors(false);
				// Refresh the reviews list and form
				handleReviewUpdated();
				onSubmitSuccess?.();
			} else {
				showNotification.error(
					"Submission Failed",
					"Failed to submit review. Please try again.",
				);
			}
		} catch (error) {
			console.error("Error submitting review:", error);

			// Extract error message from backend response if available
			let errorMessage = "Submission Failed";
			let errorDescription =
				"An unexpected error occurred while submitting the review";

			if (error instanceof Error) {
				errorMessage = error.message || errorMessage;
				// If the error message contains detailed information, use it as description
				if (error.message && error.message.length > 50) {
					errorDescription = error.message;
					errorMessage = "Submission Failed";
				}
			}

			showNotification.error(errorMessage, errorDescription);
		}
	};

	const handleReviewUpdated = () => {
		// Refresh both the review form and existing reviews
		if (submissionId) {
			fetchReviewForm(submissionId);
			fetchSubmissionReviews(submissionId);
		}
	};

	const columns: ColumnsType<ChecklistItemWithResponse> = [
		{
			title: "Question",
			dataIndex: "name",
			key: "name",
			render: (value, record) => (
				<div>
					<Text strong={record.isRequired}>
						{value}
						{record.isRequired && (
							<Text type="danger" style={{ marginLeft: "4px" }}>
								*
							</Text>
						)}
					</Text>
					{record.isRequired &&
						!answers[record.id]?.response &&
						showValidationErrors && (
							<div>
								<Text type="danger" style={{ fontSize: "11px" }}>
									Required question - please answer
								</Text>
							</div>
						)}
				</div>
			),
		},
		{
			title: "Response",
			key: "response",
			render: (_value, record) => (
				<Radio.Group
					value={answers[record.id]?.response}
					onChange={(e) => handleResponseChange(record.id, e.target.value)}
					disabled={isMainReviewer}
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
					placeholder={
						isMainReviewer
							? "Notes field (read-only for main reviewers)"
							: "Add notes..."
					}
					value={answers[record.id]?.notes}
					onChange={(e) => handleNotesChange(record.id, e.target.value)}
					disabled={isMainReviewer}
				/>
			),
		},
		{
			title: "Priority",
			key: "priority",
			align: "center",
			render: (_value, record) => {
				const label = record.isRequired ? "Mandatory" : "Optional";
				const color = priorityColorMap[label];
				return <Tag color={color}>{label}</Tag>;
			},
		},
	];

	return (
		<Space direction="vertical" size="large" style={{ width: "100%" }}>
			{/* Submission Files Section with loading state */}
			{reviewFormLoading ? (
				<div>
					<Text strong>Submission Files:</Text>
					<div
						style={{
							background: "#fafafa",
							border: "1px solid #f0f0f0",
							borderRadius: "6px",
							padding: "12px",
							marginTop: 8,
						}}
					>
						<Skeleton active paragraph={{ rows: 2 }} />
					</div>
				</div>
			) : reviewForm ? (
				<div>
					{/* Submission Files Section */}
					{reviewForm.documents && reviewForm.documents.length > 0 ? (
						<div>
							<Text strong>
								Submission Files ({reviewForm.documents.length} files):
							</Text>
							<div
								style={{
									background: "#fafafa",
									border: "1px solid #f0f0f0",
									borderRadius: "6px",
									padding: "12px",
									marginTop: 8,
								}}
							>
								{reviewForm.documents.map((docUrl: string, index: number) => (
									<div
										key={docUrl}
										style={{
											display: "flex",
											alignItems: "center",
											padding: "8px 0",
											borderBottom:
												index < reviewForm.documents.length - 1
													? "1px solid #f0f0f0"
													: "none",
										}}
									>
										<DownloadOutlined
											style={{
												color: "#1890ff",
												marginRight: 8,
												fontSize: "14px",
											}}
										/>
										<Button
											type="link"
											size="small"
											style={{
												paddingLeft: 0,
												color: "#1890ff",
												fontSize: "14px",
												textAlign: "left",
												height: "auto",
												display: "flex",
												alignItems: "center",
											}}
											onClick={() => window.open(docUrl, "_blank")}
										>
											{getFileNameFromUrl(docUrl)}
										</Button>
									</div>
								))}
							</div>
						</div>
					) : (
						<div>
							<Text
								strong
								style={{
									fontSize: "14px",
									marginBottom: 8,
									display: "block",
								}}
							>
								Submission Files:
							</Text>
							<div
								style={{
									background: "#fafafa",
									border: "1px solid #f0f0f0",
									borderRadius: "6px",
									padding: "12px",
									textAlign: "center",
								}}
							>
								<Text type="secondary">No submission files available</Text>
							</div>
						</div>
					)}
				</div>
			) : null}

			{/* Existing Reviews Section */}
			<ExistingReviewsList
				reviews={submissionReviews}
				loading={submissionReviewsLoading}
				onReviewUpdated={handleReviewUpdated}
			/>

			{/* Only show new review form if no existing reviews */}
			{submissionReviews.length === 0 && (
				<>
					{/* Checklist table */}
					<div>
						<Table
							rowKey="id"
							dataSource={checklistItems}
							columns={columns}
							pagination={false}
							loading={reviewFormLoading}
						/>
					</div>

					{/* Feedback section */}
					<div>
						<h4 style={{ marginBottom: "8px" }}>
							General Feedback
							{showValidationErrors && !getValidationStatus.hasFeedback && (
								<Text
									type="danger"
									style={{ fontSize: "12px", marginLeft: "8px" }}
								>
									*Required
								</Text>
							)}
						</h4>
						<Input.TextArea
							placeholder={
								isMainReviewer
									? "You can view the feedback requirements here (read-only for main reviewers)"
									: "Enter your general feedback for this submission..."
							}
							value={feedback}
							onChange={(e) => setFeedback(e.target.value)}
							rows={4}
							disabled={isMainReviewer}
							status={
								showValidationErrors &&
								!getValidationStatus.hasFeedback &&
								feedback.length === 0
									? "error"
									: undefined
							}
						/>
						{showValidationErrors &&
							!getValidationStatus.hasFeedback &&
							feedback.length === 0 && (
								<Text type="danger" style={{ fontSize: "12px" }}>
									Please provide general feedback
								</Text>
							)}
					</div>

					{/* Error display */}
					{error && (
						<div style={{ color: "red", marginTop: 8 }}>Error: {error}</div>
					)}

					{/* Show different content based on reviewer type */}
					{isMainReviewer ? (
						<div
							style={{
								padding: "16px",
								textAlign: "center",
								background: "#fff7e6",
								borderRadius: "8px",
								border: "1px solid #ffd591",
								marginTop: "16px",
							}}
						>
							<Text type="secondary" style={{ fontSize: "16px" }}>
								📋 You are viewing as a <strong>Main Reviewer</strong>
							</Text>
							<br />
							<Text
								type="secondary"
								style={{ fontSize: "14px", marginTop: "8px" }}
							>
								You can review the checklist but cannot submit feedback. Only
								secondary reviewers can submit reviews.
							</Text>
						</div>
					) : (
						<div
							style={{
								padding: "16px",
								textAlign: "center",
								background: "#f6ffed",
								borderRadius: "8px",
								border: "1px solid #b7eb8f",
								marginTop: "16px",
								marginBottom: "16px",
							}}
						>
							<Text type="secondary" style={{ fontSize: "16px" }}>
								✅ You are reviewing as a <strong>Secondary Reviewer</strong>
							</Text>
							<br />
							<Text
								type="secondary"
								style={{ fontSize: "14px", marginTop: "8px" }}
							>
								You can submit your review and feedback for this submission.
							</Text>
							<Row justify="center" style={{ marginTop: "16px" }}>
								<Button
									type="primary"
									onClick={handleSaveChecklist}
									loading={submitting}
									disabled={
										!reviewForm ||
										checklistItems.length === 0 ||
										!getValidationStatus.isValid
									}
									size="large"
								>
									Submit Review
								</Button>
							</Row>
						</div>
					)}
				</>
			)}

			{/* Show enhanced message when there are existing reviews */}
			{submissionReviews.length > 0 && (
				<div
					style={{
						padding: "16px",
						textAlign: "center",
						background: "#f0f9ff",
						borderRadius: "8px",
						border: "1px solid #91d5ff",
						marginTop: "16px",
					}}
				>
					<Text type="secondary" style={{ fontSize: "16px" }}>
						📝 <strong>Reviews Completed</strong>
					</Text>
					<br />
					<Text type="secondary" style={{ fontSize: "14px", marginTop: "8px" }}>
						Reviews have been submitted by secondary reviewers. You can view and
						update them using the edit buttons above.
					</Text>
				</div>
			)}
		</Space>
	);
}
