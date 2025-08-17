import {
	Button,
	Card,
	Col,
	Progress,
	Row,
	Space,
	Typography,
	Collapse,
} from "antd";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { GroupConfirmationModals } from "@/components/common/ConfirmModal";
import { ListPagination } from "@/components/common/ListPagination";
import {
	type SuggestGroupsData,
	type SuggestedGroup,
} from "@/lib/services/ai.service";
import requestService, {
	type GroupRequest,
} from "@/lib/services/requests.service";
import { showNotification } from "@/lib/utils/notification";
import { useGroupDashboardStore } from "@/store/useGroupDashboardStore";

const { Title, Text } = Typography;

interface AISuggestionsProps {
	readonly suggestions: SuggestGroupsData | null;
	readonly loading?: boolean;
	readonly onRequestSent?: () => void;
	readonly existingRequests?: readonly GroupRequest[];
}

interface AISuggestionCardProps {
	group: SuggestedGroup;
	onRequestSent?: () => void;
	existingRequests?: readonly GroupRequest[];
}

const AISuggestionCard: React.FC<AISuggestionCardProps> = ({
	group,
	onRequestSent,
	existingRequests = [],
}) => {
	const [isRequesting, setIsRequesting] = useState(false);
	const router = useRouter();

	// Calculate percentage for compatibility score (0-1 scale to percentage)
	const compatibilityPercentage = Math.round(group.compatibility * 100);

	// Group status logic - similar to GroupCard (but without member count checks since AI suggestions don't provide this)
	const groupStatus = useMemo(() => {
		const pendingInviteRequest = existingRequests.find(
			(req) =>
				req.group.id === group.id &&
				req.type === "Invite" &&
				req.status === "Pending",
		);

		const pendingJoinRequest = existingRequests.find(
			(req) =>
				req.group.id === group.id &&
				req.type === "Join" &&
				req.status === "Pending",
		);

		return {
			hasPendingInviteRequest: !!pendingInviteRequest,
			hasPendingJoinRequest: !!pendingJoinRequest,
			hasNoMembers: false, // AI suggestions don't provide member count, assume groups have members
			isGroupFull: false, // AI suggestions don't provide member count, assume groups aren't full
		};
	}, [group.id, existingRequests]);

	const handleViewDetail = () => {
		router.push(`/student/join-group/${group.id}`);
	};

	const handleJoinSuccess = async () => {
		showNotification.success(
			"Success",
			"You have successfully joined the group!",
		);

		// Use the same logic as accept invite - refresh group data and redirect
		const { refreshGroup } = useGroupDashboardStore.getState();

		// Similar to group creation flow, trigger refresh and redirect
		await refreshGroup();

		// Add a small delay to ensure API has processed the group membership
		await new Promise((resolve) => setTimeout(resolve, 1000));
		await refreshGroup();

		// Redirect to group dashboard
		router.push("/student/group-dashboard");
	};

	const handleJoinRequest = () => {
		// For AI suggestions, we don't know member count, so always use requestToJoin flow
		GroupConfirmationModals.requestToJoin(
			group.name,
			async () => {
				setIsRequesting(true);
				try {
					const response = await requestService.joinGroup(group.id);

					// Check response or request status to determine if directly joined
					if (response.success && response.data?.status === "Approved") {
						// Direct join successful (auto-approved)
						await handleJoinSuccess();
					} else {
						// Request created and pending
						showNotification.success(
							"Success",
							"Join request sent successfully! The group leader will review your request.",
						);
						onRequestSent?.();
					}
				} catch (error: unknown) {
					const apiError = error as {
						response?: { data?: { error?: string } };
						message?: string;
					};
					const errorMessage =
						apiError?.response?.data?.error ||
						(error as Error)?.message ||
						"Failed to send join request. Please try again.";
					showNotification.error("Error", errorMessage);
				} finally {
					setIsRequesting(false);
				}
			},
			isRequesting,
		);
	};

	// Button configuration based on group status - simplified for AI suggestions
	const getButtonConfig = () => {
		const { hasPendingInviteRequest, hasPendingJoinRequest } = groupStatus;

		if (hasPendingInviteRequest) {
			return {
				title: "You have been invited to this group - click to view details",
				text: "View Invite",
				clickHandler: handleViewDetail,
				disabled: false,
			};
		}

		if (hasPendingJoinRequest) {
			return {
				title: "Request already sent",
				text: "Request Sent",
				clickHandler: undefined,
				disabled: true,
			};
		}

		// For AI suggestions, default to "Request to Join" since we don't know member count
		return {
			title: "Request to Join",
			text: "Request to Join",
			clickHandler: handleJoinRequest,
			disabled: false,
		};
	};

	const buttonConfig = getButtonConfig();

	return (
		<Card
			hoverable
			size="small"
			title={
				<div style={{ padding: "8px 0" }}>
					<Space direction="vertical" size={0}>
						<Text strong>{group.name}</Text>
						<Text type="secondary" style={{ fontSize: "12px" }}>
							{group.code}
						</Text>
					</Space>
				</div>
			}
			style={{ height: "100%" }}
		>
			<div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
				<div style={{ flex: 1 }}>
					<Space direction="vertical" size="small" style={{ width: "100%" }}>
						{/* Compatibility Score */}
						<div>
							<Row justify="space-between" align="middle">
								<Col>
									<Text strong style={{ fontSize: "14px" }}>
										Compatibility
									</Text>
								</Col>
								<Col>
									<Text style={{ fontSize: "12px", fontWeight: "bold" }}>
										{compatibilityPercentage}%
									</Text>
								</Col>
							</Row>
							<Progress
								percent={compatibilityPercentage}
								strokeColor={{
									"0%": "#108ee9",
									"100%": "#87d068",
								}}
								showInfo={false}
								size="small"
							/>
						</div>
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
						title={buttonConfig.title}
						onClick={buttonConfig.clickHandler}
						loading={isRequesting}
						disabled={isRequesting || buttonConfig.disabled}
					>
						{buttonConfig.text}
					</Button>
				</div>
			</div>
		</Card>
	);
};

export default function AISuggestions({
	suggestions,
	loading = false,
	onRequestSent,
	existingRequests = [],
}: AISuggestionsProps) {
	const [currentPage, setCurrentPage] = useState(1);
	const pageSize = 3;

	// Memoize sorted suggestions by compatibility score
	const sortedGroups = useMemo(() => {
		if (!suggestions?.groups) return [];
		return [...suggestions.groups].sort(
			(a, b) => b.compatibility - a.compatibility,
		);
	}, [suggestions?.groups]);

	// Calculate paginated data
	const startIndex = (currentPage - 1) * pageSize;
	const endIndex = startIndex + pageSize;
	const paginatedGroups = sortedGroups.slice(startIndex, endIndex);

	if (loading) {
		return (
			<Card>
				<div style={{ textAlign: "center", padding: "40px 0" }}>
					<Text>Loading AI suggestions...</Text>
				</div>
			</Card>
		);
	}

	if (!suggestions || suggestions.groups.length === 0) {
		return null; // Don't render anything when no suggestions
	}

	return (
		<Card>
			<Space direction="vertical" size="large" style={{ width: "100%" }}>
				<div>
					<Title level={5} style={{ margin: 0 }}>
						AI Group Suggestions ({suggestions.groups.length} groups found)
					</Title>
					<Text type="secondary">
						Groups are ranked by compatibility score based on your
						responsibilities.
					</Text>
				</div>

				{/* AI Reasoning */}
				<Collapse
					items={[
						{
							key: "reason",
							label: "Why these groups were suggested",
							children: <Text>{suggestions.reason}</Text>,
						},
					]}
				/>

				<Row gutter={[16, 16]}>
					{paginatedGroups.map((group) => (
						<Col xs={24} sm={24} md={12} lg={8} xl={8} key={group.id}>
							<AISuggestionCard
								group={group}
								onRequestSent={onRequestSent}
								existingRequests={existingRequests}
							/>
						</Col>
					))}
				</Row>

				{suggestions.groups.length > pageSize && (
					<ListPagination
						current={currentPage}
						total={suggestions.groups.length}
						pageSize={pageSize}
						onChange={(page) => setCurrentPage(page)}
						itemName="groups"
					/>
				)}
			</Space>
		</Card>
	);
}
