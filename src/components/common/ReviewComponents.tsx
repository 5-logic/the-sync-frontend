import { Tag, Typography, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { SubmissionReview } from "@/lib/services/reviews.service";
import { getPriorityConfig } from "@/lib/utils/uiConstants";

const { Text } = Typography;

interface ReviewerInfoProps {
	readonly review: SubmissionReview;
	readonly label?: string;
}

export function ReviewerInfo({ review, label = "Reviewed by" }: ReviewerInfoProps) {
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

interface ReviewDatesProps {
	readonly createdAt: string;
	readonly updatedAt: string;
}

export function ReviewDates({ createdAt, updatedAt }: ReviewDatesProps) {
	return (
		<div>
			<Text type="secondary">
				Created: {new Date(createdAt).toLocaleDateString()}
			</Text>
			{updatedAt !== createdAt && (
				<>
					<br />
					<Text type="secondary">
						Updated: {new Date(updatedAt).toLocaleDateString()}
					</Text>
				</>
			)}
		</div>
	);
}

export interface ReviewItemData {
	readonly checklistItemId: string;
	readonly name: string;
	readonly description: string;
	readonly isRequired: boolean;
	readonly acceptance: string;
	readonly note?: string;
}

interface ReviewItemsTableProps {
	readonly reviewItems: ReviewItemData[];
	readonly showDescription?: boolean;
}

export function ReviewItemsTable({ 
	reviewItems, 
	showDescription = true 
}: ReviewItemsTableProps) {
	const columns: ColumnsType<ReviewItemData> = [
		{
			title: "Question",
			dataIndex: "name",
			key: "name",
			width: showDescription ? "25%" : "35%",
		},
		...(showDescription ? [{
			title: "Description",
			dataIndex: "description",
			key: "description",
			width: "25%",
		}] : []),
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
		<Table
			rowKey="checklistItemId"
			dataSource={reviewItems}
			columns={columns}
			pagination={false}
			size="small"
			scroll={{ x: 800 }}
		/>
	);
}
