"use client";

import { Button, Card, Progress, Space, Typography, Popover } from "antd";
import { useRouter } from "next/navigation";

import { DuplicateThesis } from "@/lib/services/ai-duplicate.service";

interface Props {
	readonly duplicateThesis: DuplicateThesis;
}

// Separate component for percentage display to avoid nested component definition
interface PercentageDisplayProps {
	readonly percent: number;
	readonly color: string;
}

const PercentageDisplay = ({ percent, color }: PercentageDisplayProps) => (
	<span
		style={{
			color,
			fontWeight: "bold",
			fontSize: "12px",
		}}
	>
		{percent}%
	</span>
);

export default function DuplicateThesisCard({ duplicateThesis }: Props) {
	const router = useRouter();

	// Get duplicate percentage color
	const getPercentageColor = (percentage: number) => {
		if (percentage >= 80) return "#ff4d4f"; // Red
		if (percentage >= 60) return "#fa8c16"; // Orange
		if (percentage >= 40) return "#fadb14"; // Yellow
		return "#52c41a"; // Green
	};

	// Format function for progress component
	const formatPercentage = (percent: number | undefined) => (
		<PercentageDisplay
			percent={percent || 0}
			color={getPercentageColor(duplicateThesis.duplicatePercentage)}
		/>
	);

	// Handle view thesis details
	const handleViewDetails = () => {
		router.push(`/lecturer/thesis-management/${duplicateThesis.id}`);
	};

	return (
		<Card
			title={null}
			style={{
				height: "100%",
				display: "flex",
				flexDirection: "column",
				borderRadius: 12,
			}}
			bodyStyle={{ display: "flex", flexDirection: "column", flexGrow: 1 }}
		>
			<Space
				direction="vertical"
				size="middle"
				style={{ width: "100%", flexGrow: 1 }}
			>
				{/* Duplicate Percentage */}
				<div style={{ textAlign: "center" }}>
					<Progress
						type="circle"
						percent={duplicateThesis.duplicatePercentage}
						size={60}
						strokeColor={getPercentageColor(
							duplicateThesis.duplicatePercentage,
						)}
						format={formatPercentage}
					/>
					<Typography.Text
						type="secondary"
						style={{ display: "block", marginTop: 8 }}
					>
						Similarity
					</Typography.Text>
				</div>

				{/* English Title */}
				<Typography.Title
					level={5}
					style={{
						marginBottom: 0,
						display: "-webkit-box",
						WebkitLineClamp: 2,
						WebkitBoxOrient: "vertical",
						overflow: "hidden",
						textOverflow: "ellipsis",
						lineHeight: "1.4",
						minHeight: "2.8em",
						maxHeight: "2.8em",
					}}
				>
					{duplicateThesis.englishName}
				</Typography.Title>

				{/* Vietnamese Title */}
				<Typography.Text
					type="secondary"
					style={{
						display: "-webkit-box",
						WebkitLineClamp: 2,
						WebkitBoxOrient: "vertical",
						overflow: "hidden",
						textOverflow: "ellipsis",
						lineHeight: "1.4",
						minHeight: "2.8em", // Always maintain 2 lines height
						maxHeight: "2.8em",
						fontStyle: "italic",
					}}
				>
					{duplicateThesis.vietnameseName || "\u00A0"}{" "}
					{/* Non-breaking space if empty */}
				</Typography.Text>

				{/* Description */}
				<Typography.Text
					type="secondary"
					style={{
						display: "-webkit-box",
						WebkitLineClamp: 3,
						WebkitBoxOrient: "vertical",
						overflow: "hidden",
						textOverflow: "ellipsis",
						lineHeight: "1.4",
						minHeight: "4.2em",
						maxHeight: "4.2em",
					}}
				>
					{duplicateThesis.description}
				</Typography.Text>

				{/* Reason duplicate */}
				{duplicateThesis.reasons && duplicateThesis.reasons.length > 0 && (
					<Popover
						content={
							<div style={{ maxWidth: 300 }}>
								<Typography.Text strong>Duplicate reasons:</Typography.Text>
								<div style={{ margin: "8px 0 0 0" }}>
									{duplicateThesis.reasons.map((reason) => (
										<div
											key={reason}
											style={{ marginBottom: 4, paddingLeft: 8 }}
										>
											<Typography.Text>• {reason}</Typography.Text>
										</div>
									))}
								</div>
							</div>
						}
						title="Why is this thesis marked as duplicate?"
						trigger="click"
						placement="top"
					>
						<Button
							type="link"
							size="small"
							style={{
								padding: 0,
								height: "auto",
								fontSize: "12px",
								color: "#1890ff",
							}}
						>
							Reason duplicate
						</Button>
					</Popover>
				)}
			</Space>

			{/* View Details Button */}
			<Button
				type="primary"
				block
				onClick={handleViewDetails}
				style={{ marginTop: 16 }}
			>
				View Thesis Detail
			</Button>
		</Card>
	);
}
