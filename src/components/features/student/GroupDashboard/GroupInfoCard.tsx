import { ReloadOutlined } from "@ant-design/icons";
import { Button, Card, Divider, Space, Spin, Typography } from "antd";
import { useRouter } from "next/navigation";
import { memo, useEffect, useState } from "react";

import {
	ResponsibilityRadarChart,
	ResponsibilityData,
} from "@/components/common/radar-chart";
import EditGroupInfoDialog from "@/components/features/student/GroupDashboard/EditGroupInfoDialog";
import { GroupConfirmationModals } from "@/components/features/student/GroupDashboard/GroupConfirmationModals";
import GroupMembersCard from "@/components/features/student/GroupDashboard/GroupMembersCard";
import InviteMembersDialog from "@/components/features/student/GroupDashboard/InviteMembersDialog";
import { useSessionData } from "@/hooks/auth/useAuth";
import { GROUP_MAX_MEMBERS } from "@/lib/constants/group";
import groupService, {
	GroupResponsibilityAverage,
} from "@/lib/services/groups.service";
import { formatDate } from "@/lib/utils/dateFormat";
import { handleApiError } from "@/lib/utils/handleApi";
import { showNotification } from "@/lib/utils/notification";
import { GroupDashboard } from "@/schemas/group";
import { useRequestsStore } from "@/store";
import { useGroupDashboardStore } from "@/store/useGroupDashboardStore";

const { Title, Text } = Typography;

interface GroupInfoCardProps {
	readonly group: GroupDashboard;
	readonly viewOnly?: boolean;
	readonly isDashboardView?: boolean;
}

export default memo(function GroupInfoCard({
	group,
	viewOnly = false,
	isDashboardView = false,
}: GroupInfoCardProps) {
	const [isInviteDialogVisible, setIsInviteDialogVisible] = useState(false);
	const [isEditDialogVisible, setIsEditDialogVisible] = useState(false);
	const [isLeaving, setIsLeaving] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [localGroup, setLocalGroup] = useState<GroupDashboard>(group);
	const [groupResponsibilities, setGroupResponsibilities] = useState<
		GroupResponsibilityAverage[]
	>([]);
	const [responsibilitiesLoading, setResponsibilitiesLoading] = useState(false);
	const { session } = useSessionData();
	const { clearGroup } = useGroupDashboardStore();
	const { fetchGroupRequests } = useRequestsStore();
	const router = useRouter();

	// Sync local state with prop changes
	useEffect(() => {
		setLocalGroup(group);
	}, [group]);

	// Fetch group responsibilities when group ID changes
	useEffect(() => {
		const fetchResponsibilities = async () => {
			setResponsibilitiesLoading(true);
			try {
				const response = await groupService.getGroupResponsibilities(group.id);
				if (response.success) {
					setGroupResponsibilities(response.data);
				}
			} catch (error) {
				console.error("Error fetching group responsibilities:", error);
				const { message } = handleApiError(
					error,
					"Failed to fetch group responsibilities",
				);
				showNotification.error("Fetch Failed", message);
			} finally {
				setResponsibilitiesLoading(false);
			}
		};

		fetchResponsibilities();
	}, [group.id]);

	const handleInviteSuccess = () => {
		setIsInviteDialogVisible(false);
		// Refresh group data to reflect any changes
		handleRefreshGroup();
	};

	const handleRefreshGroup = async () => {
		setIsRefreshing(true);
		try {
			// Fetch fresh group data directly without updating global store
			const response = await groupService.getStudentGroup();
			if (response.success && response.data.length > 0) {
				// Update local component state with fresh data
				setLocalGroup(response.data[0]);
			}

			// Also refresh requests to get latest request data
			await fetchGroupRequests(localGroup.id, true);

			// Refresh group responsibilities data
			const responsibilitiesResponse =
				await groupService.getGroupResponsibilities(localGroup.id);
			if (responsibilitiesResponse.success) {
				setGroupResponsibilities(responsibilitiesResponse.data);
			}
		} catch {
			showNotification.error(
				"Refresh Failed",
				"Failed to refresh group information. Please try again.",
			);
		} finally {
			setIsRefreshing(false);
		}
	};

	// Check if current user is the leader
	const isCurrentUserLeader = session?.user?.id === localGroup.leader.userId;

	// Check if group has reached maximum members
	const hasReachedMaxMembers = localGroup.members.length >= GROUP_MAX_MEMBERS;

	// Check if semester is in PREPARING status (can leave group and invite members even with thesis)
	const canLeaveOrInvite = localGroup.semester.status === "Preparing";

	// Check if semester is NOT in PREPARING status - hide action buttons
	const shouldHideActionButtons = localGroup.semester.status !== "Preparing";

	// Helper function to get Leave Group button title
	const getLeaveGroupButtonTitle = () => {
		if (!canLeaveOrInvite) {
			return "Cannot leave group during this semester status";
		}
		if (isCurrentUserLeader && localGroup.members.length > 1) {
			return "Transfer leadership before leaving";
		}
		return "Leave this group";
	};

	const handleLeaveGroup = async () => {
		if (!canLeaveOrInvite) {
			showNotification.error(
				"Cannot Leave Group",
				"Cannot leave group. Semester is not in PREPARING status.",
			);
			return;
		}

		if (isCurrentUserLeader && localGroup.members.length > 1) {
			showNotification.error(
				"Transfer Leadership Required",
				"As a leader, you must transfer leadership to another member before leaving the group.",
			);
			return;
		}

		setIsLeaving(true);
		try {
			await groupService.leaveGroup(localGroup.id);
			showNotification.success("Success", "Successfully left the group!");
			// Clear group data from store
			clearGroup();
			// Navigate to form or join group page since user no longer has a group
			router.push("/student/join-group");
		} catch {
			showNotification.error(
				"Error",
				"Failed to leave group. Please try again.",
			);
		} finally {
			setIsLeaving(false);
		}
	};

	// Helper function to get Invite Members button title
	const getInviteMembersButtonTitle = () => {
		if (!canLeaveOrInvite) {
			return "Cannot invite members during this semester status";
		}
		if (hasReachedMaxMembers) {
			return `Cannot invite more members. Maximum ${GROUP_MAX_MEMBERS} members allowed.`;
		}
		return "Invite new members to this group";
	};

	const showLeaveGroupConfirm = () => {
		const canLeave =
			canLeaveOrInvite &&
			!(isCurrentUserLeader && localGroup.members.length > 1);

		GroupConfirmationModals.leaveGroup(
			localGroup.name,
			canLeave,
			isCurrentUserLeader,
			false, // isOnlyMember - no longer relevant
			canLeaveOrInvite,
			handleLeaveGroup,
			isLeaving,
		);
	};

	const handleCardClick = () => {
		if (isDashboardView) {
			router.push("/student/group-dashboard");
		}
	};

	return (
		<Spin spinning={isRefreshing} tip="Refreshing group information...">
			<Card
				className="bg-white border border-gray-200 rounded-md"
				hoverable={isDashboardView}
			>
				<div className="pb-4">
					<div className="flex justify-between items-center">
						<Title
							level={4}
							className="text-base font-bold text-gray-600 mb-3"
							onClick={handleCardClick}
							style={{
								cursor: isDashboardView ? "pointer" : "default",
								transition: "color 0.2s ease",
							}}
							onMouseEnter={(e) => {
								if (isDashboardView) {
									e.currentTarget.style.color = "#1890ff";
								}
							}}
							onMouseLeave={(e) => {
								if (isDashboardView) {
									e.currentTarget.style.color = "";
								}
							}}
						>
							Group Information
						</Title>
						<div className="flex gap-2">
							{/* Refresh Button - always visible when not in viewOnly mode */}
							{!viewOnly && (
								<Button
									icon={<ReloadOutlined />}
									onClick={handleRefreshGroup}
									loading={isRefreshing}
									title="Refresh group information"
								/>
							)}
							{/* Edit Group Info Button - only visible to leader */}
							{!viewOnly && isCurrentUserLeader && (
								<Button
									type="primary"
									onClick={() => setIsEditDialogVisible(true)}
									title="Edit group information"
								>
									Edit Group Info
								</Button>
							)}
						</div>
					</div>
					<Divider className="bg-gray-100 my-3" size="small" />
				</div>

				<div className="space-y-4">
					{/* Group Details */}
					<div className="space-y-4">
						{/* Basic Group Info */}
						<div
							className={`grid grid-cols-1 gap-4 ${isDashboardView ? "md:grid-cols-2" : "md:grid-cols-3"}`}
						>
							<div>
								<Text className="text-sm text-gray-400 block font-semibold">
									Group Name
								</Text>
								<Text className="text-sm text-gray-600">{localGroup.name}</Text>
							</div>
							<div>
								<Text className="text-sm text-gray-400 block font-semibold">
									Group Code
								</Text>
								<Text className="text-sm text-gray-600">{localGroup.code}</Text>
							</div>
							{!isDashboardView && (
								<div>
									<Text className="text-sm text-gray-400 block font-semibold">
										Semester
									</Text>
									<Text className="text-sm text-gray-600">
										{localGroup.semester.name}
									</Text>
								</div>
							)}
						</div>{" "}
						{/* Project Direction */}
						<div>
							<Text className="text-sm text-gray-400 block font-semibold">
								Project Direction
							</Text>
							<Text className="text-sm text-gray-600">
								{localGroup.projectDirection || (
									<span className="text-gray-400 italic">Not specified</span>
								)}
							</Text>
						</div>
						{/* Members Section */}
						<div>
							<Text className="text-sm text-gray-400 block font-semibold">
								Members
							</Text>
							{/* Members Display */}
							{isDashboardView ? (
								<Text className="text-sm text-gray-600">
									{localGroup.members.length} member
									{localGroup.members.length !== 1 ? "s" : ""}
								</Text>
							) : (
								<GroupMembersCard
									group={localGroup}
									viewOnly={viewOnly}
									onRefresh={handleRefreshGroup}
								/>
							)}
						</div>
						{/* Group Responsibility Levels - Only show in full view, not dashboard view */}
						{!isDashboardView && (
							<div>
								<Text className="text-sm text-gray-400 block font-semibold mb-2">
									Average Responsibility Levels
								</Text>
								{(() => {
									if (responsibilitiesLoading) {
										return (
											<div
												style={{
													height: 200,
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
												}}
											>
												<Spin />
											</div>
										);
									}

									if (groupResponsibilities.length > 0) {
										return (
											<ResponsibilityRadarChart
												data={groupResponsibilities.map(
													(resp): ResponsibilityData => ({
														responsibilityId: resp.responsibilityId,
														responsibilityName: resp.responsibilityName,
														level: resp.averageLevel,
													}),
												)}
												height={350}
												loading={responsibilitiesLoading}
											/>
										);
									}

									return (
										<Text className="text-sm text-gray-400 italic">
											No responsibility data available
										</Text>
									);
								})()}
							</div>
						)}
					</div>{" "}
					{/* Created Date and Action Buttons */}
					<div
						className={`flex flex-col sm:flex-row sm:items-end ${viewOnly ? "sm:justify-start" : "sm:justify-between"} gap-4 pt-4`}
					>
						<div className="flex-shrink-0">
							<Text className="text-sm text-gray-400 block font-semibold">
								Created Date
							</Text>
							<Text className="text-sm text-gray-600 whitespace-nowrap">
								{formatDate(localGroup.createdAt)}
							</Text>
						</div>

						{/* Action buttons only shown when not in viewOnly mode and semester is Preparing */}
						{!viewOnly && !shouldHideActionButtons && (
							<Space>
								{/* Leave Group Button - visible to all members */}
								<Button
									danger
									loading={isLeaving}
									disabled={
										!canLeaveOrInvite ||
										(isCurrentUserLeader && localGroup.members.length > 1)
									}
									onClick={showLeaveGroupConfirm}
									title={getLeaveGroupButtonTitle()}
								>
									Leave Group
								</Button>

								{/* Invite Members Button - only visible to leader */}
								{isCurrentUserLeader && (
									<Button
										type="primary"
										onClick={() => setIsInviteDialogVisible(true)}
										disabled={!canLeaveOrInvite || hasReachedMaxMembers}
										title={getInviteMembersButtonTitle()}
									>
										Invite Members
									</Button>
								)}
							</Space>
						)}
					</div>
				</div>

				{/* Invite dialog only shown when not in viewOnly mode */}
				{!viewOnly && (
					<InviteMembersDialog
						visible={isInviteDialogVisible}
						onCancel={() => setIsInviteDialogVisible(false)}
						onSuccess={handleInviteSuccess}
						groupId={localGroup.id}
						group={localGroup}
					/>
				)}

				{/* Edit Group Info dialog only shown when not in viewOnly mode */}
				{!viewOnly && (
					<EditGroupInfoDialog
						visible={isEditDialogVisible}
						onCancel={() => setIsEditDialogVisible(false)}
						onSuccess={() => {
							setIsEditDialogVisible(false);
							// Update local state with fresh data after successful edit
							handleRefreshGroup();
						}}
						group={localGroup}
					/>
				)}
			</Card>
		</Spin>
	);
});
