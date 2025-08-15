import { UserOutlined } from "@ant-design/icons";
import { Button, Card, Grid, Space, Tag, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { GroupConfirmationModals } from "@/components/common/ConfirmModal";
import { DOMAIN_COLOR_MAP } from "@/lib/constants/domains";
import requestService, {
	type GroupRequest,
} from "@/lib/services/requests.service";
import { showNotification } from "@/lib/utils/notification";

const { Text } = Typography;
const { useBreakpoint } = Grid;

const CARD_CONFIG = {
	MIN_HEIGHT: 280,
	BORDER_RADIUS: 12,
	PADDING_MOBILE: 16,
	PADDING_DESKTOP: 24,
	BUTTON_HEIGHT: 40,
	BUTTON_BORDER_RADIUS: 6,
} as const;

const TEXT_CONFIG = {
	TITLE_LINE_CLAMP: 2,
	TITLE_LINE_HEIGHT: 1.3,
	LEADER_LINE_CLAMP: 2, // Changed from DESC_LINE_CLAMP
	LEADER_LINE_HEIGHT: 1.4, // Changed from DESC_LINE_HEIGHT
} as const;

interface GroupUI {
	readonly id: string;
	readonly name: string;
	readonly leader: string; // Changed from description to leader
	readonly domain: string;
	readonly members: number;
}

interface GroupCardProps {
	readonly group: GroupUI;
	readonly fontSize: number;
	readonly onRequestSent?: () => void;
	readonly existingRequests?: readonly GroupRequest[];
}

export default function GroupCard({
	group,
	fontSize,
	onRequestSent,
	existingRequests = [],
}: GroupCardProps) {
	const [isRequesting, setIsRequesting] = useState(false);
	const router = useRouter();
	const screens = useBreakpoint();
	const padding = screens.xs
		? CARD_CONFIG.PADDING_MOBILE
		: CARD_CONFIG.PADDING_DESKTOP;

	// Check if user already has a pending join request for this group
	const hasPendingJoinRequest = existingRequests.some(
		(request) =>
			request.groupId === group.id &&
			request.type === "Join" &&
			request.status === "Pending",
	);

	// Check if user has a pending invite request for this group
	const hasPendingInviteRequest = existingRequests.some(
		(request) =>
			request.groupId === group.id &&
			request.type === "Invite" &&
			request.status === "Pending",
	);

	// Check if group is full (≥5 members)
	const isGroupFull = group.members >= 5;

	// Check if group has no members
	const hasNoMembers = group.members <= 0;

	const handleJoinRequest = () => {
		if (hasNoMembers) {
			// Direct join for groups with no members
			GroupConfirmationModals.joinGroup(
				group.name,
				async () => {
					setIsRequesting(true);
					try {
						await requestService.joinGroup(group.id);
						showNotification.success(
							"Success",
							"You have successfully joined the group!",
						);
						onRequestSent?.();
					} catch {
						showNotification.error(
							"Error",
							"Failed to join the group. Please try again.",
						);
					} finally {
						setIsRequesting(false);
					}
				},
				isRequesting,
			);
		} else {
			// Request to join for groups with existing members
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
						onRequestSent?.();
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
		}
	};

	const handleViewDetail = () => {
		router.push(`/student/join-group/${group.id}`);
	};

	// Extract nested ternary operations into independent statements
	const getButtonTitle = () => {
		if (hasPendingInviteRequest) {
			return "You have been invited to this group - click to view details";
		}
		if (hasPendingJoinRequest) {
			return "Request already sent";
		}
		if (isGroupFull) {
			return "Group is full (5/5 members)";
		}
		if (hasNoMembers) {
			return "Join this group directly";
		}
		return "Request to Join";
	};

	const getButtonAriaLabel = () => {
		if (hasPendingInviteRequest) {
			return `You have been invited to ${group.name}`;
		}
		if (hasPendingJoinRequest) {
			return `Request already sent to ${group.name}`;
		}
		if (isGroupFull) {
			return `${group.name} is full`;
		}
		if (hasNoMembers) {
			return `Join ${group.name} directly`;
		}
		return `Request to join ${group.name}`;
	};

	const getButtonText = () => {
		if (hasPendingInviteRequest) {
			return "View Invite";
		}
		if (hasPendingJoinRequest) {
			return "Request Sent";
		}
		if (isGroupFull) {
			return "Group Full";
		}
		if (hasNoMembers) {
			return "Join Group";
		}
		return "Request to Join";
	};

	const getButtonClickHandler = () => {
		if (hasPendingInviteRequest) {
			return handleViewDetail;
		}
		if (isGroupFull) {
			return undefined; // No action when group is full
		}
		return handleJoinRequest;
	};

	const getCardStyles = () => ({
		borderRadius: CARD_CONFIG.BORDER_RADIUS,
		width: "100%",
		minHeight: CARD_CONFIG.MIN_HEIGHT,
		height: "100%",
		display: "flex",
		flexDirection: "column" as const,
	});

	const getBodyStyles = () => ({
		padding,
		display: "flex",
		flexDirection: "column" as const,
		flex: 1,
		justifyContent: "space-between",
	});

	const getTitleStyles = () => ({
		margin: 0,
		marginBottom: 8,
		fontSize: fontSize + 2,
		fontWeight: 600,
		lineHeight: TEXT_CONFIG.TITLE_LINE_HEIGHT,
		overflow: "hidden",
		display: "-webkit-box",
		WebkitLineClamp: TEXT_CONFIG.TITLE_LINE_CLAMP,
		WebkitBoxOrient: "vertical" as const,
		textOverflow: "ellipsis",
		wordBreak: "break-word" as const,
		minHeight: `${(fontSize + 2) * TEXT_CONFIG.TITLE_LINE_HEIGHT * TEXT_CONFIG.TITLE_LINE_CLAMP}px`,
		maxHeight: `${(fontSize + 2) * TEXT_CONFIG.TITLE_LINE_HEIGHT * TEXT_CONFIG.TITLE_LINE_CLAMP}px`,
		whiteSpace: "normal" as const,
		color: "rgba(0, 0, 0, 0.88)",
	});

	const getLeaderStyles = () => ({
		fontSize,
		lineHeight: TEXT_CONFIG.LEADER_LINE_HEIGHT,
		overflow: "hidden",
		display: "-webkit-box",
		WebkitLineClamp: TEXT_CONFIG.LEADER_LINE_CLAMP,
		WebkitBoxOrient: "vertical" as const,
		textOverflow: "ellipsis",
		wordBreak: "break-word" as const,
		minHeight: `${fontSize * TEXT_CONFIG.LEADER_LINE_HEIGHT * TEXT_CONFIG.LEADER_LINE_CLAMP}px`,
		maxHeight: `${fontSize * TEXT_CONFIG.LEADER_LINE_HEIGHT * TEXT_CONFIG.LEADER_LINE_CLAMP}px`,
		whiteSpace: "normal" as const,
		color: "rgba(0, 0, 0, 0.45)",
	});

	const getButtonStyles = (
		isPrimary: boolean = false,
		isDisabled: boolean = false,
	) => ({
		borderRadius: CARD_CONFIG.BUTTON_BORDER_RADIUS,
		border: isPrimary
			? undefined
			: isDisabled
				? "1px solid #d9d9d9"
				: "1px solid #222",
		fontWeight: 500,
		fontSize: Math.min(fontSize - 1, 12),
		height: CARD_CONFIG.BUTTON_HEIGHT,
		lineHeight: "18px",
		padding: "0 12px",
		flex: "1 1 0",
		minWidth: "120px",
	});

	return (
		<Card hoverable style={getCardStyles()} bodyStyle={getBodyStyles()}>
			<div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
				<div style={{ flex: 1 }}>
					<div style={getTitleStyles()} title={group.name}>
						{group.name}
					</div>
					<Tag
						color={DOMAIN_COLOR_MAP[group.domain] || "default"}
						style={{ fontSize: fontSize - 3, marginBottom: 8 }}
					>
						{group.domain}
					</Tag>
					<div style={getLeaderStyles()} title={`Leader: ${group.leader}`}>
						<strong>Leader:</strong> {group.leader}
					</div>
					<Space align="center" style={{ marginTop: 8 }}>
						<UserOutlined
							style={{ fontSize: fontSize - 1, color: "#bfbfbf" }}
						/>
						<Text
							type="secondary"
							style={{ fontSize: fontSize - 2, marginLeft: 4 }}
						>
							{group.members} members
						</Text>
					</Space>
				</div>
				<div
					style={{
						marginTop: 16,
						display: "flex",
						flexDirection: "column",
						gap: 8,
					}}
				>
					<div
						style={{
							display: "flex",
							gap: 8,
							flexWrap: "wrap",
						}}
					>
						<Button
							style={getButtonStyles(false, hasNoMembers)}
							title={
								hasNoMembers ? "No members in this group" : "View Group Detail"
							}
							aria-label={
								hasNoMembers
									? `${group.name} has no members`
									: `View details for ${group.name}`
							}
							onClick={handleViewDetail}
							disabled={hasNoMembers}
						>
							View Group Detail
						</Button>
						<Button
							type="primary"
							style={getButtonStyles(
								true,
								isRequesting || hasPendingJoinRequest || isGroupFull,
							)}
							title={getButtonTitle()}
							aria-label={getButtonAriaLabel()}
							onClick={getButtonClickHandler()}
							loading={isRequesting}
							disabled={isRequesting || hasPendingJoinRequest || isGroupFull}
						>
							{getButtonText()}
						</Button>
					</div>
				</div>
			</div>
		</Card>
	);
}
