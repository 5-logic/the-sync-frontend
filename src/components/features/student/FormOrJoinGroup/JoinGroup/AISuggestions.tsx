import { Button, Card, Col, Progress, Row, Space, Tag, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { GroupConfirmationModals } from "@/components/common/ConfirmModal";
import { ListPagination } from "@/components/common/ListPagination";
import { type GroupSuggestion } from "@/lib/services/ai.service";
import requestService from "@/lib/services/requests.service";
import { showNotification } from "@/lib/utils/notification";

const { Title, Text } = Typography;

interface AISuggestionsProps {
	readonly suggestions: GroupSuggestion[];
	readonly loading?: boolean;
}

interface AISuggestionCardProps {
	suggestion: GroupSuggestion;
}

const AISuggestionCard: React.FC<AISuggestionCardProps> = ({ suggestion }) => {
	const [isRequesting, setIsRequesting] = useState(false);
	const router = useRouter();

	const {
		group,
		compatibilityScore,
		matchingSkills,
		matchingResponsibilities,
	} = suggestion;

	// Calculate percentage for compatibility score (assuming max score is around 100)
	const compatibilityPercentage = Math.min(compatibilityScore, 100);

	// Check if group is full (≥5 members)
	const isGroupFull = group.currentMembersCount >= 5;

	const handleViewDetail = () => {
		router.push(`/student/join-group/${group.id}`);
	};

	const handleJoinRequest = () => {
		GroupConfirmationModals.requestToJoin(
			group.name,
			async () => {
				setIsRequesting(true);
				try {
					await requestService.joinGroup(group.id);
					showNotification.success(
						"Success",
						"Join request sent successfully! The group leader will review your request.",
					);
				} catch {
					showNotification.error(
						"Error",
						"Failed to send join request. Please try again.",
					);
				} finally {
					setIsRequesting(false);
				}
			},
			isRequesting,
		);
	};

	return (
		<Card
			hoverable
			size="small"
			title={
				<div style={{ padding: "8px 0" }}>
					<Row justify="space-between" align="middle">
						<Col>
							<Space direction="vertical" size={0}>
								<Text strong>{group.name}</Text>
								<Text type="secondary" style={{ fontSize: "12px" }}>
									{group.code}
								</Text>
							</Space>
						</Col>
						<Col>
							<Progress
								type="circle"
								size={40}
								percent={compatibilityPercentage}
								format={(percent) => `${percent}%`}
							/>
						</Col>
					</Row>
				</div>
			}
			style={{ height: "100%" }}
		>
			<div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
				<div style={{ flex: 1 }}>
					<Space direction="vertical" size="small" style={{ width: "100%" }}>
						{/* Project Direction */}
						<div>
							<Text strong>Project Direction: </Text>
							<Tag color="blue">{group.projectDirection}</Tag>
						</div>

						{/* Leader */}
						<div>
							<Text strong>Leader: </Text>
							<Text>{group.leader.name}</Text>
						</div>

						{/* Members */}
						<div>
							<Text strong>Members: </Text>
							<Text>{group.currentMembersCount}/5</Text>
						</div>

						{/* Matching Stats */}
						<Row gutter={16}>
							<Col span={12}>
								<div style={{ textAlign: "center" }}>
									<Text type="secondary" style={{ fontSize: "12px" }}>
										Matching Skills
									</Text>
									<div
										style={{
											fontSize: "16px",
											fontWeight: "bold",
											color: "#52c41a",
										}}
									>
										{matchingSkills}
									</div>
								</div>
							</Col>
							<Col span={12}>
								<div style={{ textAlign: "center" }}>
									<Text type="secondary" style={{ fontSize: "12px" }}>
										Matching Responsibilities
									</Text>
									<div
										style={{
											fontSize: "16px",
											fontWeight: "bold",
											color: "#1890ff",
										}}
									>
										{matchingResponsibilities}
									</div>
								</div>
							</Col>
						</Row>
					</Space>
				</div>

				{/* Action Buttons */}
				<div
					style={{
						marginTop: 16,
						display: "flex",
						gap: 8,
						flexDirection: "column",
					}}
				>
					<Button
						style={{
							borderRadius: 6,
							border: "1px solid #222",
							fontWeight: 500,
							fontSize: 12,
							height: 40,
							width: "100%",
						}}
						title="View Group Detail"
						onClick={handleViewDetail}
					>
						View Group Detail
					</Button>
					<Button
						type="primary"
						style={{
							borderRadius: 6,
							fontWeight: 500,
							fontSize: 12,
							height: 40,
							width: "100%",
						}}
						title={
							isGroupFull ? "Group is full" : `Request to join ${group.name}`
						}
						onClick={handleJoinRequest}
						loading={isRequesting}
						disabled={isRequesting || isGroupFull}
					>
						{isGroupFull ? "Group Full" : "Request to Join"}
					</Button>
				</div>
			</div>
		</Card>
	);
};

export default function AISuggestions({
	suggestions,
	loading = false,
}: AISuggestionsProps) {
	const [currentPage, setCurrentPage] = useState(1);
	const pageSize = 3;

	// Memoize sorted suggestions by compatibility score
	const sortedSuggestions = useMemo(() => {
		return [...suggestions].sort(
			(a, b) => b.compatibilityScore - a.compatibilityScore,
		);
	}, [suggestions]);

	// Calculate paginated data
	const startIndex = (currentPage - 1) * pageSize;
	const endIndex = startIndex + pageSize;
	const paginatedSuggestions = sortedSuggestions.slice(startIndex, endIndex);

	if (loading) {
		return (
			<Card>
				<div style={{ textAlign: "center", padding: "40px 0" }}>
					<Text>Loading AI suggestions...</Text>
				</div>
			</Card>
		);
	}

	if (suggestions.length === 0) {
		return null; // Don't render anything when no suggestions
	}

	return (
		<Card>
			<Space direction="vertical" size="large" style={{ width: "100%" }}>
				<div>
					<Title level={5} style={{ margin: 0 }}>
						AI Group Suggestions ({suggestions.length} groups found)
					</Title>
					<Text type="secondary">
						Groups are ranked by compatibility score based on your skills and
						responsibilities.
					</Text>
				</div>

				<Row gutter={[16, 16]}>
					{paginatedSuggestions.map((suggestion) => (
						<Col
							xs={24}
							sm={24}
							md={12}
							lg={8}
							xl={8}
							key={suggestion.group.id}
						>
							<AISuggestionCard suggestion={suggestion} />
						</Col>
					))}
				</Row>

				{suggestions.length > pageSize && (
					<ListPagination
						current={currentPage}
						total={suggestions.length}
						pageSize={pageSize}
						onChange={(page) => setCurrentPage(page)}
						itemName="groups"
					/>
				)}
			</Space>
		</Card>
	);
}
