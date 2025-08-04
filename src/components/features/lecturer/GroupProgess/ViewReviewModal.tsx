"use client";

import { Modal, Table, Tag, Typography, Divider } from "antd";
import type { ColumnsType } from "antd/es/table";

import { SubmissionReview } from "@/lib/services/reviews.service";
import { getPriorityConfig } from "@/lib/utils/uiConstants";

const { Text } = Typography;

interface Props {
	readonly open: boolean;
	readonly onClose: () => void;
	readonly review: SubmissionReview | null;
}

interface ReviewItemData {
	readonly checklistItemId: string;
	readonly name: string;
	readonly description: string;
	readonly isRequired: boolean;
	readonly acceptance: string;
	readonly note?: string;
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

	const columns: ColumnsType<ReviewItemData> = [
		{
			title: "Question",
			dataIndex: "name",
			key: "name",
			width: "25%",
		},
		{
			title: "Description",
			dataIndex: "description",
			key: "description",
			width: "25%",
		},
		{
			title: "Response",
			key: "response",
			width: "10%",
			render: (_, record) => {
				let color = "default";
				if (record.acceptance === "Yes") color = "green";
				else if (record.acceptance === "No") color = "red";
				else if (record.acceptance === "NotAvailable") color = "orange";

				return <Tag color={color}>{record.acceptance}</Tag>;
			},
		},
		{
			title: "Notes",
			dataIndex: "note",
			key: "notes",
			width: "30%",
			render: (note) => note || <Text type="secondary">No notes</Text>,
		},
		{
			title: "Priority",
			key: "priority",
			align: "center",
			width: "10%",
			render: (_, record) => {
				const { label, color } = getPriorityConfig(record.isRequired);
				return <Tag color={color}>{label}</Tag>;
			},
		},
	];

	return (
		<Modal
			title="Review Details"
			open={open}
			onCancel={onClose}
			width={1200}
			footer={null}
		>
			<div>
				{/* Review Info */}
				<div style={{ marginBottom: 16 }}>
					<div style={{ marginBottom: 8 }}>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: 8,
								marginBottom: 8,
							}}
						>
							<strong>Reviewer:</strong>
							<Text strong>{review.lecturer.user.fullName}</Text>
							{review.isMainReviewer === true ? (
								<Tag color="yellow">Main Reviewer</Tag>
							) : (
								<Tag color="blue">Secondary Reviewer</Tag>
							)}
						</div>

						<div>
							<Text type="secondary">
								Created: {new Date(review.createdAt).toLocaleDateString()}
							</Text>
							{review.updatedAt !== review.createdAt && (
								<>
									<br />
									<Text type="secondary">
										Updated: {new Date(review.updatedAt).toLocaleDateString()}
									</Text>
								</>
							)}
						</div>
					</div>
				</div>

				<Divider />

				{/* General Feedback */}
				<div style={{ marginBottom: 24 }}>
					<h4>General Feedback</h4>
					<div
						style={{
							padding: "12px",
							background: "#f5f5f5",
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
					<Table
						rowKey="checklistItemId"
						dataSource={reviewItems}
						columns={columns}
						pagination={false}
						size="small"
						scroll={{ x: 800 }}
					/>
				</div>
			</div>
		</Modal>
	);
}
