"use client";

import { ArrowLeftOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Col, Row, Space, Spin, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { GroupConfirmationModals } from "@/components/common/ConfirmModal";
import GroupInfoCard from "@/components/features/student/GroupDashboard/GroupInfoCard";
import { useSessionData } from "@/hooks/auth/useAuth";
import groupService from "@/lib/services/groups.service";
import requestService from "@/lib/services/requests.service";
import { showNotification } from "@/lib/utils/notification";
import { GroupDashboard } from "@/schemas/group";
import { useGroupDashboardStore } from "@/store/useGroupDashboardStore";
import { useRequestsStore } from "@/store/useRequestsStore";

const { Title, Paragraph } = Typography;

interface GroupDetailClientProps {
	readonly groupId: string;
}

export default function GroupDetailClient({ groupId }: GroupDetailClientProps) {
	const [group, setGroup] = useState<GroupDashboard | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isRequesting, setIsRequesting] = useState(false);
	const [requestsLoaded, setRequestsLoaded] = useState(false);
	const router = useRouter();
	const { session } = useSessionData();
	const { requests, fetchStudentRequests } = useRequestsStore();

	useEffect(() => {
		const fetchGroupDetail = async () => {
			try {
				setLoading(true);
				setError(null);

				// Fetch group details using the public group service method
				const response = await groupService.getPublicGroupDetail(groupId);

				if (response.success) {
					setGroup(response.data);
				} else {
					setError(response.error || "Failed to load group details");
				}
			} catch (err) {
				console.error("Error fetching group detail:", err);
				setError(
					"Failed to load group details. The group may not exist or you may not have permission to view it.",
				);
			} finally {
				setLoading(false);
			}
		};

		const fetchStudentRequestsData = async () => {
			if (session?.user?.id) {
				try {
					// Force refresh to get latest requests
					await fetchStudentRequests(true);
					setRequestsLoaded(true);
				} catch (err) {
					console.error("Error fetching student requests:", err);
					setRequestsLoaded(true); // Set to true even on error to not block UI
				}
			} else {
				setRequestsLoaded(true); // No user session, consider loaded
			}
		};

		if (groupId) {
			fetchGroupDetail();
			fetchStudentRequestsData();
		}
	}, [groupId, session?.user?.id, fetchStudentRequests]);

	const handleJoinRequest = async () => {
		if (!group) return;

		GroupConfirmationModals.requestToJoin(
			group.name,
			async () => {
				setIsRequesting(true);
				try {
					const response = await requestService.joinGroup(group.id);

					// Check response to determine if directly joined or created request
					if (response.success && response.data?.status === "Approved") {
						// Direct join successful (auto-approved)
						showNotification.success("You have successfully joined the group!");

						// Use the same logic as accept invite - refresh group data and redirect
						const { refreshGroup } = useGroupDashboardStore.getState();

						// Similar to group creation flow, trigger refresh and redirect
						await refreshGroup();

						// Add a small delay to ensure API has processed the group membership
						await new Promise((resolve) => setTimeout(resolve, 1000));
						await refreshGroup();

						// Redirect to group dashboard
						router.push("/student/group-dashboard");
					} else {
						// Request created and pending
						showNotification.success(
							"Join request sent successfully! The group leader will review your request.",
						);
						// Refresh requests to update button state
						await fetchStudentRequests(true);
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
					showNotification.error(errorMessage);
				} finally {
					setIsRequesting(false);
				}
			},
			isRequesting,
		);
	};

	const handleInviteResponse = async (action: "Approved" | "Rejected") => {
		if (!pendingInviteRequest) return;

		setIsRequesting(true);
		try {
			// Use 'Cancelled' for reject action instead of 'Rejected'
			const status = action === "Rejected" ? "Cancelled" : action;
			const { updateRequestStatus } = useRequestsStore.getState();
			const success = await updateRequestStatus(
				pendingInviteRequest.id,
				status,
			);

			if (success) {
				showNotification.success(
					`Invite ${action.toLowerCase()} successfully!`,
				);

				if (action === "Approved") {
					// Get refreshGroup from the store to update the group status
					const { refreshGroup } = useGroupDashboardStore.getState();

					// Similar to group creation flow, trigger refresh and redirect
					await refreshGroup();

					// Add a small delay to ensure API has processed the group membership
					await new Promise((resolve) => setTimeout(resolve, 1000));
					await refreshGroup();

					// Redirect to group dashboard
					router.push("/student/group-dashboard");
				} else {
					// If rejecting, navigate back to groups page
					router.push("/student/join-group");
				}
			} else {
				showNotification.error(
					`Failed to ${action.toLowerCase()} invite. Please try again.`,
				);
			}
		} catch {
			showNotification.error(
				`Failed to ${action.toLowerCase()} invite. Please try again.`,
			);
		} finally {
			setIsRequesting(false);
		}
	};

	const handleCancelJoinRequest = async () => {
		if (!group) return;

		GroupConfirmationModals.cancelJoinRequest(
			group.name,
			async () => {
				const { cancelRequest } = useRequestsStore.getState();

				// Find the pending join request
				const pendingJoinRequest = requests.find(
					(request) =>
						request.groupId === groupId &&
						request.status === "Pending" &&
						request.type === "Join",
				);

				if (!pendingJoinRequest) return;

				setIsRequesting(true);
				try {
					const success = await cancelRequest(pendingJoinRequest.id);
					if (success) {
						showNotification.success(
							"Success",
							"Join request cancelled successfully!",
						);
						// Refresh requests to update button state
						await fetchStudentRequests(true);
					} else {
						showNotification.error(
							"Error",
							"Failed to cancel join request. Please try again.",
						);
					}
				} catch {
					showNotification.error(
						"Error",
						"Failed to cancel join request. Please try again.",
					);
				} finally {
					setIsRequesting(false);
				}
			},
			isRequesting,
		);
	};

	const handleBack = () => {
		router.push("/student/join-group");
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-[400px]">
				<Spin size="large" />
			</div>
		);
	}

	if (error || !group) {
		return (
			<Card className="text-center">
				<Title level={4} type="danger">
					{error || "Group not found"}
				</Title>
				<Button
					type="primary"
					onClick={handleBack}
					icon={<ArrowLeftOutlined />}
				>
					Back to Groups
				</Button>
			</Card>
		);
	}

	// Check if current user is already a member of this group
	const isCurrentUserMember = group.members.some(
		(member) => member.userId === session?.user?.id,
	);

	// Check if user has already sent a pending join request to this group
	const hasPendingJoinRequest =
		requestsLoaded &&
		requests.some(
			(request) =>
				request.groupId === groupId &&
				request.status === "Pending" &&
				request.type === "Join",
		);

	// Check if user has a pending invite request to this group
	const hasPendingInviteRequest =
		requestsLoaded &&
		requests.some(
			(request) =>
				request.groupId === groupId &&
				request.status === "Pending" &&
				request.type === "Invite",
		);

	// Get the pending invite request for actions
	const pendingInviteRequest = requests.find(
		(request) =>
			request.groupId === groupId &&
			request.status === "Pending" &&
			request.type === "Invite",
	);

	// Check if semester is in PREPARING status (when join requests are allowed)
	const canJoinGroup = group.semester.status === "Preparing";

	// Check if group is full (≥5 members)
	const isGroupFull = group.members.length >= 5;

	// Check if user can actually send join request (both semester status and group capacity)
	const canSendJoinRequest = canJoinGroup && !isGroupFull;

	// Extract nested ternary operations into independent statements
	const getJoinButtonTitle = () => {
		if (!canJoinGroup) {
			return "Join requests are not allowed during this semester status";
		}
		if (isGroupFull) {
			return `Group is full (${group.members.length}/5 members)`;
		}
		return "Send a request to join this group";
	};

	const renderActionButtons = () => {
		if (hasPendingInviteRequest) {
			// If user has pending invite, show approve/reject buttons
			return (
				<>
					<Button
						danger
						onClick={() => handleInviteResponse("Rejected")}
						loading={isRequesting}
					>
						Reject Invite
					</Button>
					<Button
						type="primary"
						onClick={() => handleInviteResponse("Approved")}
						loading={isRequesting}
					>
						Accept Invite
					</Button>
				</>
			);
		}

		if (hasPendingJoinRequest) {
			// If user has pending join request, show cancel button
			return (
				<Button
					danger
					onClick={handleCancelJoinRequest}
					loading={isRequesting}
					title="Cancel your join request to this group"
				>
					Cancel Request
				</Button>
			);
		}

		// Default: show join request button
		return (
			<Button
				type="primary"
				onClick={handleJoinRequest}
				loading={isRequesting}
				disabled={!canSendJoinRequest}
				title={getJoinButtonTitle()}
			>
				{isGroupFull ? "Group Full" : "Request to Join"}
			</Button>
		);
	};

	return (
		<Space direction="vertical" size="large" style={{ width: "100%" }}>
			{/* Header Section */}
			<Row align="middle" justify="space-between" wrap>
				<Col xs={24}>
					<Space direction="vertical" size="small">
						<Title level={2} style={{ marginBottom: 0 }}>
							Group Details
						</Title>
						<Paragraph type="secondary" style={{ marginBottom: 0 }}>
							View detailed information about the group including members,
							skills, responsibilities and project direction.
						</Paragraph>
					</Space>
				</Col>
			</Row>

			{/* Show message if user is already a member */}
			{isCurrentUserMember && (
				<Card>
					<div className="text-green-600 font-medium text-center">
						You are already a member of this group
					</div>
				</Card>
			)}

			{/* Show invite message if user has a pending invite */}
			{hasPendingInviteRequest && (
				<Alert
					message="You have been invited to join this group"
					type="info"
					showIcon
					banner
				/>
			)}

			{/* Group Information Card */}
			<GroupInfoCard group={group} viewOnly />

			{/* Action Buttons */}
			<Card>
				<div
					style={{
						display: "flex",
						justifyContent: "flex-end",
						alignItems: "center",
						gap: 8,
					}}
				>
					{/* Back Button */}
					<Button onClick={handleBack} icon={<ArrowLeftOutlined />}>
						Back to Groups
					</Button>

					{/* Show different buttons based on request status */}
					{!isCurrentUserMember && renderActionButtons()}
				</div>
			</Card>
		</Space>
	);
}
