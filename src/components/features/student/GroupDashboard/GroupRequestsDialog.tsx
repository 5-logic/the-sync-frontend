import {
	CheckOutlined,
	CloseOutlined,
	ReloadOutlined,
	SearchOutlined,
	StopOutlined,
} from '@ant-design/icons';
import {
	Button,
	Input,
	Modal,
	Popconfirm,
	Select,
	Table,
	Tabs,
	Tag,
	Tooltip,
	Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo, useState } from 'react';

import TablePagination from '@/components/common/TablePagination/TablePagination';
import { useSessionData } from '@/hooks/auth/useAuth';
import { type GroupRequest } from '@/lib/services/requests.service';
import { formatDate } from '@/lib/utils/dateFormat';
import { showNotification } from '@/lib/utils/notification';
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

		// Filter by search text (user name)
		if (searchText.trim()) {
			filtered = filtered.filter((req) =>
				req.student.user.fullName
					.toLowerCase()
					.includes(searchText.toLowerCase()),
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

		// Filter by search text (user name)
		if (searchText.trim()) {
			filtered = filtered.filter((req) =>
				req.student.user.fullName
					.toLowerCase()
					.includes(searchText.toLowerCase()),
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

	// Columns for Invite Requests table
	const inviteColumns: ColumnsType<GroupRequest> = [
		{
			title: 'Student',
			key: 'student',
			render: (_, record) => (
				<div>
					<div className="font-medium">{record.student.user.fullName}</div>
					<Text type="secondary" className="text-sm">
						{record.student.studentCode} • {record.student.user.email}
					</Text>
				</div>
			),
		},
		{
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
			render: (status: string) => (
				<Tag
					color={
						status === 'Pending'
							? 'orange'
							: status === 'Approved'
								? 'green'
								: 'red'
					}
				>
					{status}
				</Tag>
			),
		},
		{
			title: 'Sent At',
			dataIndex: 'createdAt',
			key: 'createdAt',
			render: (date: string) => formatDate(date),
		},
		{
			title: 'Action',
			key: 'action',
			align: 'center',
			render: (_, record) => (
				<div className="flex justify-center">
					<Popconfirm
						{...getPopconfirmProps(
							record.id,
							'Rejected',
							'Invite',
							record.student.user.fullName,
						)}
					>
						<Tooltip title="Cancel Invitation" placement="bottom">
							<Button type="text" danger icon={<StopOutlined />} size="small" />
						</Tooltip>
					</Popconfirm>
				</div>
			),
		},
	];

	// Columns for Join Requests table
	const joinColumns: ColumnsType<GroupRequest> = [
		{
			title: 'Student',
			key: 'student',
			render: (_, record) => (
				<div>
					<div className="font-medium">{record.student.user.fullName}</div>
					<Text type="secondary" className="text-sm">
						{record.student.studentCode} • {record.student.user.email}
					</Text>
				</div>
			),
		},
		{
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
			render: (status: string) => (
				<Tag
					color={
						status === 'Pending'
							? 'orange'
							: status === 'Approved'
								? 'green'
								: 'red'
					}
				>
					{status}
				</Tag>
			),
		},
		{
			title: 'Requested At',
			dataIndex: 'createdAt',
			key: 'createdAt',
			render: (date: string) => formatDate(date),
		},
		{
			title: 'Action',
			key: 'action',
			align: 'center',
			render: (_, record) => (
				<div className="flex gap-2 justify-center">
					<Popconfirm
						{...getPopconfirmProps(
							record.id,
							'Approved',
							'Join',
							record.student.user.fullName,
						)}
					>
						<Tooltip title="Approve Request" placement="bottom">
							<Button
								type="text"
								icon={<CheckOutlined />}
								size="small"
								className="text-green-600 hover:text-green-700"
							/>
						</Tooltip>
					</Popconfirm>
					<Popconfirm
						{...getPopconfirmProps(
							record.id,
							'Rejected',
							'Join',
							record.student.user.fullName,
						)}
					>
						<Tooltip title="Reject Request" placement="bottom">
							<Button
								type="text"
								danger
								icon={<CloseOutlined />}
								size="small"
							/>
						</Tooltip>
					</Popconfirm>
				</div>
			),
		},
	];

	const tabItems = [
		{
			key: 'invite',
			label: `Invite Requests (${totalInviteRequestsCount})`,
			children: (
				<div>
					{/* Search and Filter Controls */}
					<div className="mb-4 flex gap-3 items-center">
						<Input
							prefix={<SearchOutlined />}
							placeholder="Search by user name..."
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
							className="flex-1"
							allowClear
						/>
						<Select
							value={statusFilter}
							onChange={setStatusFilter}
							style={{ width: 140 }}
							placeholder="All Status"
							allowClear
							options={[
								{ label: 'Pending', value: 'Pending' },
								{ label: 'Approved', value: 'Approved' },
								{ label: 'Rejected', value: 'Rejected' },
							]}
						/>
						<Button
							icon={<ReloadOutlined />}
							onClick={handleRefresh}
							loading={loading}
							title="Refresh data"
						>
							Refresh
						</Button>
					</div>

					<Table
						dataSource={inviteRequests}
						columns={inviteColumns}
						rowKey="id"
						loading={loading}
						pagination={TablePagination}
						locale={{
							emptyText: 'No invite requests found',
						}}
					/>
				</div>
			),
		},
		{
			key: 'join',
			label: `Join Requests (${totalJoinRequestsCount})`,
			children: (
				<div>
					{/* Search and Filter Controls */}
					<div className="mb-4 flex gap-3 items-center">
						<Input
							prefix={<SearchOutlined />}
							placeholder="Search by user name..."
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
							className="flex-1"
							allowClear
						/>
						<Select
							value={statusFilter}
							onChange={setStatusFilter}
							style={{ width: 140 }}
							placeholder="All Status"
							allowClear
							options={[
								{ label: 'Pending', value: 'Pending' },
								{ label: 'Approved', value: 'Approved' },
								{ label: 'Rejected', value: 'Rejected' },
							]}
						/>
						<Button
							icon={<ReloadOutlined />}
							onClick={handleRefresh}
							loading={loading}
							title="Refresh data"
						>
							Refresh
						</Button>
					</div>

					<Table
						dataSource={joinRequests}
						columns={joinColumns}
						rowKey="id"
						loading={loading}
						pagination={TablePagination}
						locale={{
							emptyText: 'No join requests found',
						}}
					/>
				</div>
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
