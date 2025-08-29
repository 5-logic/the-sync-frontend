import { UserOutlined } from '@ant-design/icons';
import { Button, Card, Col, Progress, Row, Space, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import AIReasoningCollapse from '@/components/common/AIReasoningCollapse';
import { GroupConfirmationModals } from '@/components/common/ConfirmModal';
import { ListPagination } from '@/components/common/ListPagination';
import {
	type SuggestGroupsData,
	type SuggestedGroup,
} from '@/lib/services/ai.service';
import requestService, {
	type GroupRequest,
} from '@/lib/services/requests.service';
import { showNotification } from '@/lib/utils/notification';
import { useGroupDashboardStore } from '@/store/useGroupDashboardStore';

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

	// Group status logic - now using actual member count from API
	const groupStatus = useMemo(() => {
		const pendingInviteRequest = existingRequests.find(
			(req) =>
				req.group.id === group.id &&
				req.type === 'Invite' &&
				req.status === 'Pending',
		);

		const pendingJoinRequest = existingRequests.find(
			(req) =>
				req.group.id === group.id &&
				req.type === 'Join' &&
				req.status === 'Pending',
		);

		const hasNoMembers = group.memberCount === 0;
		const isGroupFull = group.memberCount >= 5;

		return {
			hasPendingInviteRequest: !!pendingInviteRequest,
			hasPendingJoinRequest: !!pendingJoinRequest,
			hasNoMembers,
			isGroupFull,
		};
	}, [group.id, group.memberCount, existingRequests]);

	const handleViewDetail = () => {
		router.push(`/student/join-group/${group.id}`);
	};

	const handleJoinSuccess = async () => {
		showNotification.success(
			'Success',
			'You have successfully joined the group!',
		);

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

	const executeJoinRequest = async (successMessage: string) => {
		setIsRequesting(true);
		try {
			const response = await requestService.joinGroup(group.id);

			// Check if user directly joined or created a request
			if (
				(groupStatus.hasNoMembers && response.success) ||
				(response.success && response.data?.status === 'Approved')
			) {
				// Direct join successful
				await handleJoinSuccess();
			} else {
				// Request created and pending
				showNotification.success('Success', successMessage);
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
				'Failed to join the group. Please try again.';
			showNotification.error('Error', errorMessage);
		} finally {
			setIsRequesting(false);
		}
	};

	const handleJoinRequest = () => {
		if (groupStatus.hasNoMembers) {
			// Direct join for groups with no members
			GroupConfirmationModals.joinGroup(
				group.name,
				() =>
					executeJoinRequest(
						'Join request sent successfully! The group leader will review your request.',
					),
				isRequesting,
			);
		} else {
			// Request to join for groups with existing members
			GroupConfirmationModals.requestToJoin(
				group.name,
				() =>
					executeJoinRequest(
						'Join request sent successfully! The group leader will review your request.',
					),
				isRequesting,
			);
		}
	};

	// Button configuration based on group status - now with full group state checks
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
				text: 'View Invite',
				clickHandler: handleViewDetail,
				disabled: false,
			};
		}

		if (hasPendingJoinRequest) {
			return {
				title: 'Request already sent',
				text: 'Request Sent',
				clickHandler: undefined,
				disabled: true,
			};
		}

		if (isGroupFull) {
			return {
				title: 'Group is full (5/5 members)',
				text: 'Group Full',
				clickHandler: undefined,
				disabled: true,
			};
		}

		if (hasNoMembers) {
			return {
				title: 'Join this group directly',
				text: 'Join Group',
				clickHandler: handleJoinRequest,
				disabled: false,
			};
		}

		return {
			title: 'Request to Join',
			text: 'Request to Join',
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
				<div style={{ padding: '8px 0' }}>
					<Space direction="vertical" size={0}>
						<Text strong>{group.name}</Text>
						<Text type="secondary" style={{ fontSize: '12px' }}>
							{group.code}
						</Text>
					</Space>
				</div>
			}
			style={{ height: '100%' }}
		>
			<div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
				<div style={{ flex: 1 }}>
					<Space direction="vertical" size="small" style={{ width: '100%' }}>
						{/* Compatibility Score */}
						<div>
							<Row justify="space-between" align="middle">
								<Col>
									<Text strong style={{ fontSize: '14px' }}>
										Compatibility
									</Text>
								</Col>
								<Col>
									<Text style={{ fontSize: '12px', fontWeight: 'bold' }}>
										{compatibilityPercentage}%
									</Text>
								</Col>
							</Row>
							<Progress
								percent={compatibilityPercentage}
								strokeColor={{
									'0%': '#108ee9',
									'100%': '#87d068',
								}}
								showInfo={false}
								size="small"
							/>
						</div>

						{/* Leader Information */}
						<div>
							<Text
								strong
								style={{ fontSize: '14px', display: 'block', marginBottom: 8 }}
							>
								Leader
							</Text>
							<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
								<UserOutlined style={{ fontSize: '14px', color: '#bfbfbf' }} />
								<div>
									<Text style={{ fontSize: '14px', fontWeight: '500' }}>
										{group.leader.fullName}
									</Text>
									<br />
									<Text type="secondary" style={{ fontSize: '12px' }}>
										{group.leader.studentCode} • {group.leader.email}
									</Text>
								</div>
							</div>
						</div>

						{/* Member Count */}
						<div>
							<Row justify="space-between" align="middle">
								<Col>
									<Text strong style={{ fontSize: '14px' }}>
										Members
									</Text>
								</Col>
								<Col>
									<Text style={{ fontSize: '12px', fontWeight: 'bold' }}>
										{group.memberCount}/5
									</Text>
								</Col>
							</Row>
						</div>
					</Space>
				</div>

				{/* Action Buttons */}
				<div
					style={{
						marginTop: 16,
						display: 'flex',
						gap: 8,
						flexDirection: 'column',
					}}
				>
					<Button
						style={{
							borderRadius: 6,
							border: '1px solid #222',
							fontWeight: 500,
							fontSize: 12,
							height: 40,
							width: '100%',
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
							width: '100%',
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
				<div style={{ textAlign: 'center', padding: '40px 0' }}>
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
			<Space direction="vertical" size="large" style={{ width: '100%' }}>
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
				<AIReasoningCollapse
					reason={suggestions.reason}
					style={{ marginBottom: '16px' }}
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
