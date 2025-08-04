import { DeleteOutlined } from "@ant-design/icons";
import { Button, Space, Typography } from "antd";

import { GroupTableProps } from "@/components/features/lecturer/AssignLecturerReview/GroupTable";
import { Lecturer } from "@/lib/services/reviews.service";
import { DraftReviewerAssignment } from "@/store/useDraftReviewerAssignmentStore";

const { Text } = Typography;

/**
 * Table column widths for consistent layout
 */
export const TABLE_WIDTHS = {
	GROUP_CODE: 150,
	GROUP_NAME: 150,
	THESIS_TITLE: 500,
	SUPERVISORS: 200,
	REVIEWERS: 250,
	ACTIONS: 150,
} as const;

/**
 * Base columns configuration for reviewer assignment table
 */
export const baseColumns = [
	{
		title: "Group Code",
		dataIndex: "code",
		key: "code",
		width: TABLE_WIDTHS.GROUP_CODE,
		sorter: (a: GroupTableProps, b: GroupTableProps) =>
			a.code.localeCompare(b.code),
	},
	{
		title: "Group Name",
		dataIndex: "name",
		key: "name",
		width: TABLE_WIDTHS.GROUP_NAME,
		sorter: (a: GroupTableProps, b: GroupTableProps) =>
			a.name.localeCompare(b.name),
	},
	{
		title: "Thesis Title",
		dataIndex: "title",
		key: "title",
		width: TABLE_WIDTHS.THESIS_TITLE,
	},
	{
		title: "Supervisors",
		dataIndex: "supervisors",
		key: "supervisors",
		width: TABLE_WIDTHS.SUPERVISORS,
		render: (supervisors: Lecturer[]) =>
			supervisors.length > 0 ? (
				<div>
					{supervisors.map((supervisor) => (
						<div key={supervisor.id}>{supervisor.fullName}</div>
					))}
				</div>
			) : (
				"-"
			),
	},
	{
		title: "Reviewers",
		dataIndex: "reviewers",
		key: "reviewers",
		width: TABLE_WIDTHS.REVIEWERS,
		// This will be replaced by createReviewerRenderer
	},
] as const;

/**
 * Creates reviewer renderer with draft information display
 * Shows draft reviewers with "(Draft)" label and current reviewers below
 */
export const createReviewerRenderer = (
	getDraftReviewerAssignment: (
		submissionId: string,
	) => DraftReviewerAssignment | undefined,
) => {
	// eslint-disable-next-line react/display-name
	return (reviewers: Lecturer[], record: GroupTableProps) => {
		if (!record.submissionId) return "-";

		const draft = getDraftReviewerAssignment(record.submissionId);

		if (draft) {
			// Show draft reviewers with labels
			const draftReviewers = [];
			if (draft.mainReviewerName) {
				draftReviewers.push({
					key: "main",
					text: `Main: ${draft.mainReviewerName}`,
				});
			}
			if (draft.secondaryReviewerName) {
				draftReviewers.push({
					key: "secondary",
					text: `Secondary: ${draft.secondaryReviewerName}`,
				});
			}

			return (
				<div>
					{draftReviewers.map((reviewer) => (
						<div key={reviewer.key}>
							{reviewer.text} <Text type="warning">(Draft)</Text>
						</div>
					))}
					{/* Show current reviewers if any exist */}
					{reviewers.length > 0 && (
						<div style={{ marginTop: 8 }}>
							<Text type="secondary" style={{ fontSize: "11px" }}>
								Current: {reviewers.map((r) => r.fullName).join(", ")}
							</Text>
						</div>
					)}
				</div>
			);
		}

		// Show current reviewers when no draft
		return reviewers.length > 0 ? (
			<div>
				{reviewers.map((reviewer) => (
					<div key={reviewer.id}>{reviewer.fullName}</div>
				))}
			</div>
		) : (
			"-"
		);
	};
};

/**
 * Creates action renderer with draft delete functionality
 * Shows Assign/Change button and delete draft button when applicable
 */
export const createActionRenderer = (
	onAssign: (record: GroupTableProps) => void,
	getDraftReviewerAssignment: (
		submissionId: string,
	) => DraftReviewerAssignment | undefined,
	removeDraftReviewerAssignment: (submissionId: string) => void,
) => {
	// eslint-disable-next-line react/display-name
	return (_: unknown, record: GroupTableProps) => {
		if (!record.submissionId) {
			return (
				<Button type="primary" onClick={() => onAssign(record)}>
					Assign
				</Button>
			);
		}

		const draft = getDraftReviewerAssignment(record.submissionId);
		const reviewerCount = record.reviewers.length;
		const buttonText = reviewerCount >= 2 ? "Change" : "Assign";

		return (
			<Space size="small">
				<Button type="primary" onClick={() => onAssign(record)}>
					{buttonText}
				</Button>
				{draft && (
					<Button
						type="text"
						danger
						icon={<DeleteOutlined />}
						onClick={() => removeDraftReviewerAssignment(record.submissionId!)}
						title="Remove draft reviewer assignment"
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							padding: "4px 8px",
							borderRadius: "4px",
						}}
					/>
				)}
			</Space>
		);
	};
};
