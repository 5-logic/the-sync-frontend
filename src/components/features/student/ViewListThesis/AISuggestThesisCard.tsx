"use client";

import { UserOutlined } from "@ant-design/icons";
import {
	Avatar,
	Button,
	Card,
	Col,
	Modal,
	Progress,
	Row,
	Space,
	Tag,
	Typography,
} from "antd";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { useSemesterStatus } from "@/hooks/student/useSemesterStatus";
import { useStudentGroupStatus } from "@/hooks/student/useStudentGroupStatus";
import { useThesisRegistration } from "@/hooks/thesis";
import { ThesisSuggestion } from "@/lib/services/ai.service";
import { cacheUtils } from "@/store/helpers/cacheHelpers";

interface Props {
	readonly suggestion: ThesisSuggestion;
	readonly studentRole?: "leader" | "member" | "guest";
	readonly onThesisUpdate?: () => void | Promise<void>;
}

export default function AISuggestThesisCard({
	suggestion,
	studentRole,
	onThesisUpdate,
}: Props) {
	const { thesis, relevanceScore, matchingFactors } = suggestion;
	const { hasGroup, group, resetInitialization } = useStudentGroupStatus();
	const { isPicking, loading: semesterLoading } = useSemesterStatus();
	const { registerThesis, isRegistering } = useThesisRegistration();
	const router = useRouter();

	// State for matching factors modal
	const [isFactorsModalVisible, setIsFactorsModalVisible] = useState(false);
	// State for description expansion
	const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

	// Check if current group has this thesis assigned
	const isThesisAssignedToGroup = group?.thesis?.id === thesis.id;

	// Determine if register button should be enabled
	const canRegister =
		studentRole === "leader" && hasGroup && !isThesisAssignedToGroup;

	// Disable register button if semester is not in picking phase
	const isRegisterDisabled =
		!canRegister || !isPicking || isRegistering || semesterLoading;

	// Handle view details navigation
	const handleViewDetails = () => {
		router.push(`/student/list-thesis/${thesis.id}`);
	};

	// Handle register thesis
	const handleRegisterThesis = () => {
		registerThesis(thesis.id, thesis.englishName, () => {
			// Clear relevant caches
			cacheUtils.clear("semesterStatus");

			// Refresh group data to update UI
			resetInitialization();

			// Refresh thesis list immediately to show updated assignment
			onThesisUpdate?.();
		});
	};

	// Get button tooltip message based on current state
	const getButtonTooltip = (): string => {
		if (isThesisAssignedToGroup) {
			return "This thesis is already assigned to your group";
		}
		if (!hasGroup) {
			return "You need to be in a group to register";
		}
		if (studentRole !== "leader") {
			return "Only group leaders can register thesis";
		}
		if (!isPicking) {
			return "Thesis registration is not available in current semester phase";
		}
		return "";
	};

	// Get progress color based on relevance score
	const getProgressColor = (score: number): string => {
		if (score >= 90) return "#52c41a"; // Green
		if (score >= 70) return "#1890ff"; // Blue
		if (score >= 50) return "#faad14"; // Orange
		return "#ff4d4f"; // Red
	};

	return (
		<Card
			style={{ height: "100%", display: "flex", flexDirection: "column" }}
			bodyStyle={{ flex: 1, display: "flex", flexDirection: "column" }}
			hoverable
		>
			<Space
				direction="vertical"
				size="middle"
				style={{ width: "100%", flex: 1 }}
			>
				{/* AI Score Section */}
				<div>
					<Row justify="space-between" align="middle">
						<Col>
							<Typography.Text strong style={{ color: "#1890ff" }}>
								AI Match Score
							</Typography.Text>
						</Col>
						<Col>
							<Typography.Text strong style={{ fontSize: "16px" }}>
								{relevanceScore}%
							</Typography.Text>
						</Col>
					</Row>
					<Progress
						percent={relevanceScore}
						strokeColor={getProgressColor(relevanceScore)}
						showInfo={false}
						size="small"
					/>
				</div>

				{/* Thesis Title */}
				<div>
					<Typography.Title
						level={4}
						style={{
							margin: 0,
							marginBottom: "8px",
							minHeight: "84px",
							maxHeight: "84px",
							lineHeight: "1.4",
						}}
						ellipsis={{
							rows: 3,
							tooltip: thesis.englishName,
						}}
					>
						{thesis.englishName}
					</Typography.Title>
					<Typography.Paragraph
						type="secondary"
						style={{
							fontSize: "12px",
							margin: 0,
							minHeight: "43.2px",
							maxHeight: "43.2px",
							lineHeight: "14.4px",
							color: "rgba(0, 0, 0, 0.45)",
						}}
						ellipsis={{
							rows: 3,
							tooltip: thesis.vietnameseName,
						}}
					>
						{thesis.vietnameseName}
					</Typography.Paragraph>
				</div>

				{/* Supervisor Info */}
				<Row align="middle" gutter={8}>
					<Col>
						<Avatar size="small" icon={<UserOutlined />} />
					</Col>
					<Col flex="auto">
						<Typography.Text strong>{thesis.lecturer.name}</Typography.Text>
						<br />
						<Typography.Text type="secondary" style={{ fontSize: "12px" }}>
							{thesis.lecturer.email}
						</Typography.Text>
					</Col>
				</Row>

				{/* Description */}
				<div
					style={{
						flex: 1,
						...(isDescriptionExpanded
							? {}
							: { minHeight: "80px", maxHeight: "120px", overflow: "hidden" }),
					}}
				>
					{isDescriptionExpanded ? (
						<div>
							<Typography.Paragraph style={{ margin: 0 }}>
								{thesis.description}
							</Typography.Paragraph>
							<Button
								type="link"
								size="small"
								style={{ padding: 0, height: "auto", fontSize: "12px" }}
								onClick={() => setIsDescriptionExpanded(false)}
							>
								Show less
							</Button>
						</div>
					) : (
						<Typography.Paragraph
							ellipsis={{
								rows: 3,
								expandable: true,
								symbol: "Read more",
								onExpand: () => setIsDescriptionExpanded(true),
							}}
							style={{ margin: 0 }}
						>
							{thesis.description}
						</Typography.Paragraph>
					)}
				</div>

				{/* Matching Factors */}
				<div>
					<Button
						type="link"
						size="small"
						style={{
							padding: 0,
							height: "auto",
							fontSize: "12px",
							fontWeight: "bold",
							marginBottom: "8px",
							display: "block",
						}}
						onClick={() => setIsFactorsModalVisible(true)}
					>
						Why this matches your group? ({matchingFactors.length} reasons) →
					</Button>
				</div>

				{/* Action Buttons */}
				<Row gutter={8}>
					<Col flex="auto">
						<Button block onClick={handleViewDetails}>
							View Details
						</Button>
					</Col>
					<Col>
						{isThesisAssignedToGroup ? (
							<Button type="primary" disabled block>
								Registered
							</Button>
						) : (
							<Button
								type="primary"
								disabled={isRegisterDisabled}
								loading={isRegistering}
								onClick={handleRegisterThesis}
								title={getButtonTooltip()}
								block
							>
								Register
							</Button>
						)}
					</Col>
				</Row>
			</Space>

			{/* Matching Factors Modal */}
			<Modal
				title={
					<Space>
						<Typography.Text strong>
							Why this thesis matches your group
						</Typography.Text>
						<Tag color="blue">{relevanceScore}% match</Tag>
					</Space>
				}
				open={isFactorsModalVisible}
				onCancel={() => setIsFactorsModalVisible(false)}
				footer={[
					<Button key="close" onClick={() => setIsFactorsModalVisible(false)}>
						Close
					</Button>,
				]}
				width={600}
			>
				<Typography.Title level={5} style={{ marginTop: 0 }}>
					{thesis.englishName}
				</Typography.Title>
				<Space direction="vertical" size="middle" style={{ width: "100%" }}>
					{matchingFactors.map((factor, index) => (
						<div
							key={index}
							style={{
								padding: "12px",
								backgroundColor: "#f9f9f9",
								borderRadius: "6px",
								borderLeft: "4px solid #1890ff",
							}}
						>
							<Typography.Text style={{ lineHeight: "1.5" }}>
								<strong>{index + 1}.</strong> {factor}
							</Typography.Text>
						</div>
					))}
				</Space>
			</Modal>
		</Card>
	);
}
