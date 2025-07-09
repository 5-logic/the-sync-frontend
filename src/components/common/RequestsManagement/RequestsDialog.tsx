'use client';

import { Modal, Tabs } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import RequestsTab from '@/components/common/RequestsManagement/RequestsTab';
import { type RequestsDialogProps } from '@/components/common/RequestsManagement/types';
import { showNotification } from '@/lib/utils/notification';
import { isTextMatch } from '@/lib/utils/textNormalization';
import { useRequestsStore } from '@/store';

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
			// Force refresh when dialog opens to get latest data
			config.fetchRequests(true);
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

	// Action handlers based on mode
	const handleAcceptInvite = async (requestId: string) => {
		const success = await updateRequestStatus(requestId, 'Approved');
		if (success) {
			showNotification.success('Invitation accepted successfully!');
			onRequestsUpdate?.();
			// Close dialog after accepting invite since student will now have a group
			if (config.mode === 'student') {
				onCancel();
			}
		} else {
			showNotification.error('Failed to accept invitation. Please try again.');
		}
	};

	const handleRejectInvite = async (requestId: string) => {
		const success = await updateRequestStatus(requestId, 'Rejected');
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

	// Helper function to get action props based on mode and request type
	const getActionProps = (
		requestId: string,
		requestType: 'Invite' | 'Join',
		targetName: string,
	) => {
		if (config.mode === 'student') {
			// Student perspective
			if (requestType === 'Invite') {
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
				};
			} else {
				return {
					primaryAction: {
						text: 'Cancel',
						title: 'Cancel join request?',
						description: `Group: ${targetName}`,
						okText: 'Yes, Cancel',
						okType: 'danger' as const,
						onConfirm: () => handleCancelJoinRequest(requestId),
					},
				};
			}
		} else if (requestType === 'Invite') {
			// Group leader perspective - Invite
			return {
				primaryAction: {
					text: 'Cancel',
					title: 'Cancel invitation?',
					description: `Student: ${targetName}`,
					okText: 'Yes, Cancel',
					okType: 'danger' as const,
					onConfirm: () => handleRejectInvite(requestId),
				},
			};
		} else {
			// Group leader perspective - Join
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
			};
		}
	};

	const handleRefresh = () => {
		console.log('Manual refresh triggered for requests');
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
