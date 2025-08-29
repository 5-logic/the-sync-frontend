import { UserOutlined } from '@ant-design/icons';
import { Button, Card, Grid, Space, Tag, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { GroupConfirmationModals } from '@/components/common/ConfirmModal';
import { DOMAIN_COLOR_MAP } from '@/lib/constants/domains';
import requestService, {
	type GroupRequest,
} from '@/lib/services/requests.service';
import { showNotification } from '@/lib/utils/notification';
import { useGroupDashboardStore } from '@/store/useGroupDashboardStore';

const { Text } = Typography;
const { useBreakpoint } = Grid;

// Interface for API error response
interface ApiError {
	response?: {
		data?: {
			error?: string;
		};
	};
	message?: string;
}

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

	// Consolidated group status checks
	const groupStatus = {
		hasPendingJoinRequest: existingRequests.some(
			(request) =>
				request.groupId === group.id &&
				request.type === 'Join' &&
				request.status === 'Pending',
		),
		hasPendingInviteRequest: existingRequests.some(
			(request) =>
				request.groupId === group.id &&
				request.type === 'Invite' &&
				request.status === 'Pending',
		),
		isGroupFull: group.members >= 5,
		hasNoMembers: group.members <= 0,
	};

	// Consolidated function to handle successful group join/approval
	const handleJoinSuccess = async () => {
		showNotification.success(
			'Success',
			'You have successfully joined the group!',
		);
		onRequestSent?.();

		// Use the same logic as accept invite - refresh group data and redirect
		const { refreshGroup } = useGroupDashboardStore.getState();

		// Similar to group creation flow, trigger refresh and redirect
		await refreshGroup();

		// Add a small delay to ensure API has processed the group membership
		await new Promise((resolve) => setTimeout(resolve, 1000));
		await refreshGroup();

		// Redirect to group dashboard
		router.push('/student/group-dashboard');
	};

	const handleJoinRequest = () => {
		if (groupStatus.hasNoMembers) {
			// Direct join for groups with no members
			GroupConfirmationModals.joinGroup(
				group.name,
				async () => {
					setIsRequesting(true);
					try {
						const response = await requestService.joinGroup(group.id);

						// Check if user directly joined or created a request
						if (groupStatus.hasNoMembers && response.success) {
							// Direct join successful
							await handleJoinSuccess();
						} else {
							// Request created
							showNotification.success(
								'Success',
								'Join request sent successfully! The group leader will review your request.',
							);
							onRequestSent?.();
						}
					} catch (error: unknown) {
						const apiError = error as ApiError;
						const errorMessage =
							apiError?.response?.data?.error ||
							(error as Error)?.message ||
							'Failed to join the group. Please try again.';
						showNotification.error('Error', errorMessage);
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
						const response = await requestService.joinGroup(group.id);

						// Check response or request status to determine if directly joined
						if (response.success && response.data?.status === 'Approved') {
							// Direct join successful (auto-approved)
							await handleJoinSuccess();
						} else {
							// Request created and pending
							showNotification.success(
								'Success',
								'Join request sent successfully! The group leader will review your request.',
							);
							onRequestSent?.();
						}
					} catch (error: unknown) {
						const apiError = error as ApiError;
						const errorMessage =
							apiError?.response?.data?.error ||
							(error as Error)?.message ||
							'Failed to send join request. Please try again.';
						showNotification.error('Error', errorMessage);
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

	// Consolidated button configuration based on group status
	const getButtonConfig = () => {
		const {
			hasPendingInviteRequest,
			hasPendingJoinRequest,
			isGroupFull,
			hasNoMembers,
		} = groupStatus;

		if (hasPendingInviteRequest) {
			return {
				title: 'You have been invited to this group - click to view details',
				ariaLabel: `You have been invited to ${group.name}`,
				text: 'View Invite',
				clickHandler: handleViewDetail,
				disabled: false,
			};
		}

		if (hasPendingJoinRequest) {
			return {
				title: 'Request already sent',
				ariaLabel: `Request already sent to ${group.name}`,
				text: 'Request Sent',
				clickHandler: undefined,
				disabled: true,
			};
		}

		if (isGroupFull) {
			return {
				title: 'Group is full (5/5 members)',
				ariaLabel: `${group.name} is full`,
				text: 'Group Full',
				clickHandler: undefined,
				disabled: true,
			};
		}

		if (hasNoMembers) {
			return {
				title: 'Join this group directly',
				ariaLabel: `Join ${group.name} directly`,
				text: 'Join Group',
				clickHandler: handleJoinRequest,
				disabled: false,
			};
		}

		return {
			title: 'Request to Join',
			ariaLabel: `Request to join ${group.name}`,
			text: 'Request to Join',
			clickHandler: handleJoinRequest,
			disabled: false,
		};
	};

	// Consolidated styling functions
	const getCardStyles = () => ({
		borderRadius: CARD_CONFIG.BORDER_RADIUS,
		width: '100%',
		minHeight: CARD_CONFIG.MIN_HEIGHT,
		height: '100%',
		display: 'flex',
		flexDirection: 'column' as const,
	});

	const getBodyStyles = () => ({
		padding,
		display: 'flex',
		flexDirection: 'column' as const,
		flex: 1,
		justifyContent: 'space-between',
	});

	// Consolidated text styles with common properties
	const getTextStyles = (
		size: number,
		lineHeight: number,
		lineClamp: number,
		fontWeight?: number,
		color?: string,
	) => ({
		fontSize: size,
		fontWeight: fontWeight || 'normal',
		lineHeight,
		overflow: 'hidden',
		display: '-webkit-box',
		WebkitLineClamp: lineClamp,
		WebkitBoxOrient: 'vertical' as const,
		textOverflow: 'ellipsis',
		wordBreak: 'break-word' as const,
		minHeight: `${size * lineHeight * lineClamp}px`,
		maxHeight: `${size * lineHeight * lineClamp}px`,
		whiteSpace: 'normal' as const,
		color: color || 'inherit',
	});

	const getTitleStyles = () => ({
		margin: 0,
		marginBottom: 8,
		...getTextStyles(
			fontSize + 2,
			TEXT_CONFIG.TITLE_LINE_HEIGHT,
			TEXT_CONFIG.TITLE_LINE_CLAMP,
			600,
			'rgba(0, 0, 0, 0.88)',
		),
	});

	const getLeaderStyles = () =>
		getTextStyles(
			fontSize,
			TEXT_CONFIG.LEADER_LINE_HEIGHT,
			TEXT_CONFIG.LEADER_LINE_CLAMP,
			undefined,
			'rgba(0, 0, 0, 0.45)',
		);

	const getButtonStyles = (
		isPrimary: boolean = false,
		isDisabled: boolean = false,
	) => {
		let borderValue: string | undefined;

		if (isPrimary) {
			borderValue = undefined;
		} else if (isDisabled) {
			borderValue = '1px solid #d9d9d9';
		} else {
			borderValue = '1px solid #222';
		}

		return {
			borderRadius: CARD_CONFIG.BUTTON_BORDER_RADIUS,
			border: borderValue,
			fontWeight: 500,
			fontSize: Math.min(fontSize - 1, 12),
			height: CARD_CONFIG.BUTTON_HEIGHT,
			lineHeight: '18px',
			padding: '0 12px',
			flex: '1 1 0',
			minWidth: '120px',
		};
	};

	const buttonConfig = getButtonConfig();
	const { hasNoMembers } = groupStatus;

	return (
		<Card hoverable style={getCardStyles()} bodyStyle={getBodyStyles()}>
			<div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
				<div style={{ flex: 1 }}>
					<div style={getTitleStyles()} title={group.name}>
						{group.name}
					</div>
					<Tag
						color={DOMAIN_COLOR_MAP[group.domain] || 'default'}
						style={{ fontSize: fontSize - 3, marginBottom: 8 }}
					>
						{group.domain}
					</Tag>
					<div style={getLeaderStyles()} title={`Leader: ${group.leader}`}>
						<strong>Leader:</strong> {group.leader}
					</div>
					<Space align="center" style={{ marginTop: 8 }}>
						<UserOutlined
							style={{ fontSize: fontSize - 1, color: '#bfbfbf' }}
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
						display: 'flex',
						flexDirection: 'column',
						gap: 8,
					}}
				>
					<div
						style={{
							display: 'flex',
							gap: 8,
							flexWrap: 'wrap',
						}}
					>
						<Button
							style={getButtonStyles(false, hasNoMembers)}
							title={
								hasNoMembers ? 'No members in this group' : 'View Group Detail'
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
							style={getButtonStyles(true, buttonConfig.disabled)}
							title={buttonConfig.title}
							aria-label={buttonConfig.ariaLabel}
							onClick={buttonConfig.clickHandler}
							loading={isRequesting}
							disabled={isRequesting || buttonConfig.disabled}
						>
							{buttonConfig.text}
						</Button>
					</div>
				</div>
			</div>
		</Card>
	);
}
