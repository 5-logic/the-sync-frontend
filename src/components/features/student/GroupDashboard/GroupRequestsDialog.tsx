import { Modal, Tabs, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import RequestsTab from '@/components/features/student/GroupDashboard/GroupRequestsDialog/RequestsTab';
import { useSessionData } from '@/hooks/auth/useAuth';
import { showNotification } from '@/lib/utils/notification';
import { isTextMatch } from '@/lib/utils/textNormalization';
import { GroupDashboard } from '@/schemas/group';
import { useRequestsStore } from '@/store';

const { Text } = Typography;

interface GroupRequestsDialogProps {
	readonly visible: boolean;
	readonly onCancel: () => void;
	readonly group: GroupDashboard;
}

export default function GroupRequestsDialog({
	visible,
	onCancel,
	group,
}: GroupRequestsDialogProps) {
	const [activeTab, setActiveTab] = useState('invite');
	const [searchText, setSearchText] = useState('');
	const [statusFilter, setStatusFilter] = useState<string | undefined>(
		undefined,
	);
	const { session } = useSessionData();

	const {
		requests,
		loading,
		fetchGroupRequests,
		updateRequestStatus,
		clearRequests,
	} = useRequestsStore();

	// Check if current user is the leader
	const isCurrentUserLeader = session?.user?.id === group.leader.userId;

	// Fetch requests when dialog opens
	useEffect(() => {
		if (visible && isCurrentUserLeader) {
			fetchGroupRequests(group.id);
		}
		return () => {
			if (!visible) {
				clearRequests();
			}
		};
	}, [
		visible,
		group.id,
		isCurrentUserLeader,
		fetchGroupRequests,
		clearRequests,
	]);

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

	// Filter requests by type, status, and search text
	const inviteRequests = useMemo(() => {
		let filtered = requests.filter((req) => req.type === 'Invite');

		// Filter by status
		if (statusFilter) {
			filtered = filtered.filter((req) => req.status === statusFilter);
		}

		// Filter by search text (user name using Vietnamese text normalization)
		if (searchText.trim()) {
			filtered = filtered.filter((req) =>
				isTextMatch(searchText, [
					req.student.user.fullName,
					req.student.studentCode,
					req.student.user.email,
				]),
			);
		}

		return filtered;
	}, [requests, statusFilter, searchText]);

	const joinRequests = useMemo(() => {
		let filtered = requests.filter((req) => req.type === 'Join');

		// Filter by status
		if (statusFilter) {
			filtered = filtered.filter((req) => req.status === statusFilter);
		}

		// Filter by search text (user name using Vietnamese text normalization)
		if (searchText.trim()) {
			filtered = filtered.filter((req) =>
				isTextMatch(searchText, [
					req.student.user.fullName,
					req.student.studentCode,
					req.student.user.email,
				]),
			);
		}

		return filtered;
	}, [requests, statusFilter, searchText]);

	const handleUpdateStatus = async (
		requestId: string,
		status: 'Approved' | 'Rejected',
	) => {
		const success = await updateRequestStatus(requestId, status);
		if (success) {
			const actionText = status === 'Approved' ? 'approved' : 'rejected';
			showNotification.success(`Request ${actionText} successfully!`);
		} else {
			showNotification.error(
				'Failed to update request status. Please try again.',
			);
		}
	};

	// Helper function to get Popconfirm props based on action
	const getPopconfirmProps = (
		requestId: string,
		status: 'Approved' | 'Rejected',
		requestType: 'Invite' | 'Join',
		studentName: string,
	) => {
		const actionTitle = status === 'Approved' ? 'Approve' : 'Reject';
		const typeText = requestType === 'Invite' ? 'invitation' : 'join request';

		return {
			title: `${actionTitle} ${typeText}?`,
			description: `Student: ${studentName}`,
			okText: `Yes, ${actionTitle}`,
			cancelText: 'Cancel',
			okType:
				status === 'Rejected' ? ('danger' as const) : ('primary' as const),
			onConfirm: () => handleUpdateStatus(requestId, status),
		};
	};

	const handleRefresh = () => {
		fetchGroupRequests(group.id, true); // Force refresh
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
			label: `Invite Requests (${totalInviteRequestsCount})`,
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
					getPopconfirmProps={getPopconfirmProps}
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
					getPopconfirmProps={getPopconfirmProps}
				/>
			),
		},
	];

	if (!isCurrentUserLeader) {
		return (
			<Modal
				title="Group Requests"
				open={visible}
				onCancel={onCancel}
				footer={null}
				width={800}
			>
				<div className="text-center py-8">
					<Text type="secondary">
						Only group leaders can view and manage group requests.
					</Text>
				</div>
			</Modal>
		);
	}

	return (
		<Modal
			title={`Group Requests - ${group.name}`}
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
