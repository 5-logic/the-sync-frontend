'use client';

import { Modal, Tabs } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import RequestsTab from '@/components/common/RequestsManagement/RequestsTab';
import { type RequestsDialogProps } from '@/components/common/RequestsManagement/types';
import { type GroupRequest } from '@/lib/services/requests.service';
import { showNotification } from '@/lib/utils/notification';
import { isTextMatch } from '@/lib/utils/textNormalization';
import { useRequestsStore } from '@/store';
import { useGroupDashboardStore } from '@/store/useGroupDashboardStore';

export default function RequestsDialog({
	visible,
	onCancel,
	config,
	onRequestsUpdate,
}: Readonly<RequestsDialogProps>) {
	const [activeTab, setActiveTab] = useState('invite');
	const [searchText, setSearchText] = useState('');
	const [statusFilter, setStatusFilter] = useState<string | undefined>(
		undefined,
	);
	const router = useRouter();

	const {
		requests,
		loading,
		updateRequestStatus,
		cancelRequest,
		clearRequests,
	} = useRequestsStore();

	// Fetch requests when dialog opens
	useEffect(() => {
		if (visible) {
			// Only fetch if we don't have data yet, don't force refresh on dialog open
			config.fetchRequests(false);
		}
		return () => {
			if (!visible) {
				clearRequests();
			}
		};
		// ESLint is disabled here because including store functions in dependencies
		// would cause infinite re-renders as Zustand functions get new references
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [visible, config.groupId]);

	// Count pending requests by type (for tab labels - always show pending count)
	const totalInviteRequestsCount = useMemo(() => {
		return requests.filter(
			(req) => req.type === 'Invite' && req.status === 'Pending',
		).length;
	}, [requests]);

	const totalJoinRequestsCount = useMemo(() => {
		return requests.filter(
			(req) => req.type === 'Join' && req.status === 'Pending',
		).length;
	}, [requests]);

	// Helper function to filter requests by type, status, and search text
	const filterRequests = useMemo(() => {
		return (requestType: 'Invite' | 'Join') => {
			let filtered = requests.filter((req) => req.type === requestType);

			// Filter by status
			if (statusFilter) {
				filtered = filtered.filter((req) => req.status === statusFilter);
			}

			// Filter by search text (Vietnamese text normalization)
			if (searchText.trim()) {
				filtered = filtered.filter((req) => {
					// For group leader: search by student info
					// For student: search by group info
					const searchTargets =
						config.mode === 'group-leader'
							? [
									req.student.user.fullName,
									req.student.studentCode,
									req.student.user.email,
								]
							: [req.group.name, req.group.code];

					return isTextMatch(searchText, searchTargets);
				});
			}

			return filtered;
		};
	}, [requests, statusFilter, searchText, config.mode]);

	// Filter requests by type using the helper function
	const inviteRequests = useMemo(() => {
		return filterRequests('Invite');
	}, [filterRequests]);

	const joinRequests = useMemo(() => {
		return filterRequests('Join');
	}, [filterRequests]);

	// Get group dashboard store for refreshing group data and redirecting

	// Action handlers based on mode
	const handleAcceptInvite = async (requestId: string) => {
		const success = await updateRequestStatus(requestId, 'Approved');
		if (success) {
			showNotification.success('Invitation accepted successfully!');
			onRequestsUpdate?.();

			// For student mode, refresh group status and redirect to dashboard
			if (config.mode === 'student') {
				try {
					// Get refreshGroup from the store to update the group status
					const { refreshGroup } = useGroupDashboardStore.getState();

					// Similar to group creation flow, trigger refresh and redirect
					await refreshGroup();

					// Add a small delay to ensure API has processed the group membership
					await new Promise((resolve) => setTimeout(resolve, 1000));
					await refreshGroup();

					// Close dialog
					onCancel();

					// Redirect to group dashboard
					router.push('/student/group-dashboard');
				} catch (error) {
					console.error('Error refreshing group status:', error);
					// Close dialog if we can't refresh
					onCancel();
				}
			}
		} else {
			showNotification.error('Failed to accept invitation. Please try again.');
		}
	};

	const handleRejectInvite = async (requestId: string) => {
		// Use 'Cancelled' for student rejecting invite, 'Rejected' for group leader cancelling invite
		const status = config.mode === 'student' ? 'Cancelled' : 'Rejected';
		const success = await updateRequestStatus(requestId, status);
		if (success) {
			const message =
				config.mode === 'student'
					? 'Invitation rejected successfully!'
					: 'Invitation cancelled successfully!';
			showNotification.success(message);
			onRequestsUpdate?.();
		} else {
			const message =
				config.mode === 'student'
					? 'Failed to reject invitation. Please try again.'
					: 'Failed to cancel invitation. Please try again.';
			showNotification.error(message);
		}
	};

	const handleApproveJoinRequest = async (requestId: string) => {
		const success = await updateRequestStatus(requestId, 'Approved');
		if (success) {
			showNotification.success('Join request approved successfully!');
			onRequestsUpdate?.();
		} else {
			showNotification.error(
				'Failed to approve join request. Please try again.',
			);
		}
	};

	const handleRejectJoinRequest = async (requestId: string) => {
		const success = await updateRequestStatus(requestId, 'Rejected');
		if (success) {
			showNotification.success('Join request rejected successfully!');
			onRequestsUpdate?.();
		} else {
			showNotification.error(
				'Failed to reject join request. Please try again.',
			);
		}
	};

	const handleCancelJoinRequest = async (requestId: string) => {
		const success = await cancelRequest(requestId);
		if (success) {
			showNotification.success('Join request cancelled successfully!');
			onRequestsUpdate?.();
		} else {
			showNotification.error(
				'Failed to cancel join request. Please try again.',
			);
		}
	};

	// Helper function to create view detail action
	const createViewDetailAction = (request: GroupRequest | undefined) => {
		if (!request) return undefined;

		const isStudentMode = config.mode === 'student';
		const targetUrl = isStudentMode
			? `/student/form-or-join-group/${request.groupId}`
			: `/student/profile/${request.studentId}`;

		return {
			onViewDetail: () => router.push(targetUrl),
		};
	};

	// Helper function for student invite actions
	const getStudentInviteActions = (
		requestId: string,
		targetName: string,
		request: GroupRequest | undefined,
	) => {
		return {
			primaryAction: {
				text: 'Accept',
				title: 'Accept invitation?',
				description: `Group: ${targetName}`,
				okText: 'Yes, Accept',
				okType: 'primary' as const,
				onConfirm: () => handleAcceptInvite(requestId),
			},
			secondaryAction: {
				text: 'Reject',
				title: 'Reject invitation?',
				description: `Group: ${targetName}`,
				okText: 'Yes, Reject',
				okType: 'danger' as const,
				onConfirm: () => handleRejectInvite(requestId),
			},
			viewDetailAction: createViewDetailAction(request),
		};
	};

	// Helper function for student join actions
	const getStudentJoinActions = (
		requestId: string,
		targetName: string,
		request: GroupRequest | undefined,
	) => {
		return {
			primaryAction: {
				text: 'Cancel',
				title: 'Cancel join request?',
				description: `Group: ${targetName}`,
				okText: 'Yes, Cancel',
				okType: 'danger' as const,
				onConfirm: () => handleCancelJoinRequest(requestId),
			},
			viewDetailAction: createViewDetailAction(request),
		};
	};

	// Helper function for group leader invite actions
	const getGroupLeaderInviteActions = (
		requestId: string,
		targetName: string,
		request: GroupRequest | undefined,
	) => {
		return {
			primaryAction: {
				text: 'Cancel',
				title: 'Cancel invitation?',
				description: `Student: ${targetName}`,
				okText: 'Yes, Cancel',
				okType: 'danger' as const,
				onConfirm: () => handleRejectInvite(requestId),
			},
			viewDetailAction: createViewDetailAction(request),
		};
	};

	// Helper function for group leader join actions
	const getGroupLeaderJoinActions = (
		requestId: string,
		targetName: string,
		request: GroupRequest | undefined,
	) => {
		return {
			primaryAction: {
				text: 'Approve',
				title: 'Approve join request?',
				description: `Student: ${targetName}`,
				okText: 'Yes, Approve',
				okType: 'primary' as const,
				onConfirm: () => handleApproveJoinRequest(requestId),
			},
			secondaryAction: {
				text: 'Reject',
				title: 'Reject join request?',
				description: `Student: ${targetName}`,
				okText: 'Yes, Reject',
				okType: 'danger' as const,
				onConfirm: () => handleRejectJoinRequest(requestId),
			},
			viewDetailAction: createViewDetailAction(request),
		};
	};

	// Main function with reduced cognitive complexity
	const getActionProps = (
		requestId: string,
		requestType: 'Invite' | 'Join',
		targetName: string,
	) => {
		const request = requests.find((r) => r.id === requestId);
		const isStudentMode = config.mode === 'student';
		const isInviteType = requestType === 'Invite';

		if (isStudentMode && isInviteType) {
			return getStudentInviteActions(requestId, targetName, request);
		}

		if (isStudentMode && !isInviteType) {
			return getStudentJoinActions(requestId, targetName, request);
		}

		if (!isStudentMode && isInviteType) {
			return getGroupLeaderInviteActions(requestId, targetName, request);
		}

		return getGroupLeaderJoinActions(requestId, targetName, request);
	};

	const handleRefresh = () => {
		config.fetchRequests(true); // Force refresh
	};

	const handleSearchChange = (value: string) => {
		setSearchText(value);
	};

	const handleStatusFilterChange = (value: string | undefined) => {
		setStatusFilter(value);
	};

	const tabItems = [
		{
			key: 'invite',
			label: `Invitations (${totalInviteRequestsCount})`,
			children: (
				<RequestsTab
					requestType="invite"
					dataSource={inviteRequests}
					loading={loading}
					searchText={searchText}
					statusFilter={statusFilter}
					onSearchChange={handleSearchChange}
					onStatusFilterChange={handleStatusFilterChange}
					onRefresh={handleRefresh}
					mode={config.mode}
					getActionProps={getActionProps}
				/>
			),
		},
		{
			key: 'join',
			label: `Join Requests (${totalJoinRequestsCount})`,
			children: (
				<RequestsTab
					requestType="join"
					dataSource={joinRequests}
					loading={loading}
					searchText={searchText}
					statusFilter={statusFilter}
					onSearchChange={handleSearchChange}
					onStatusFilterChange={handleStatusFilterChange}
					onRefresh={handleRefresh}
					mode={config.mode}
					getActionProps={getActionProps}
				/>
			),
		},
	];

	// Group leader permission check
	if (config.mode === 'group-leader' && config.groupId) {
		// You might want to add group leader validation here
		// For now, we'll assume the component is only rendered for valid group leaders
	}

	return (
		<Modal
			title={config.title}
			open={visible}
			onCancel={onCancel}
			footer={null}
			width={900}
			destroyOnClose
		>
			<Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
		</Modal>
	);
}
