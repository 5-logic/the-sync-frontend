"use client";

import {
	Modal,
	Table,
	Button,
	Space,
	Tag,
	Typography,
	Input,
	Select,
	Row,
	Col,
	Popconfirm,
} from "antd";
import {
	CheckOutlined,
	CloseOutlined,
	SearchOutlined,
	ReloadOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useState, useMemo } from "react";
import { ThesisRequest } from "@/types/thesis-requests";
import { isTextMatch } from "@/lib/utils/textNormalization";

const { Title } = Typography;

interface Props {
	open: boolean;
	onClose: () => void;
	requests: ThesisRequest[];
	thesisTitle: string;
	onApprove: (groupId: string, thesisId: string) => Promise<void>;
	onReject: (groupId: string, thesisId: string) => Promise<void>;
	onRefresh?: () => void;
	loading?: boolean; // Loading for approve/reject actions
	dataLoading?: boolean; // Loading for data fetching
}

export default function ThesisRequestsModal({
	open,
	onClose,
	requests,
	thesisTitle,
	onApprove,
	onReject,
	onRefresh,
	loading,
	dataLoading,
}: Props) {
	// Filter states
	const [searchText, setSearchText] = useState("");
	const [statusFilter, setStatusFilter] = useState<string | undefined>(
		undefined,
	);

	// Wrapper functions to close dialog after successful action
	const handleApprove = async (groupId: string, thesisId: string) => {
		await onApprove(groupId, thesisId);
		onClose(); // Close dialog after successful approve
	};

	const handleReject = async (groupId: string, thesisId: string) => {
		await onReject(groupId, thesisId);
		onClose(); // Close dialog after successful reject
	};

	// Filter data based on search and status
	const filteredRequests = useMemo(() => {
		return requests.filter((request) => {
			// Search filter
			if (searchText) {
				const leader = getLeaderInfo(request);
				const matchesSearch = isTextMatch(searchText, [
					request.group.name,
					request.group.code,
					leader?.user.fullName,
					leader?.studentCode,
					leader?.user.email,
				]);
				if (!matchesSearch) return false;
			}

			// Status filter
			if (statusFilter && request.status !== statusFilter) {
				return false;
			}

			return true;
		});
	}, [requests, searchText, statusFilter]);

	const getLeaderInfo = (request: ThesisRequest) => {
		const leader = request.group.studentGroupParticipations.find(
			(participation) => participation.isLeader,
		);
		return leader?.student;
	};

	const columns: ColumnsType<ThesisRequest> = [
		{
			title: "Group",
			key: "group",
			render: (_, record) => (
				<div>
					<div>
						<strong>{record.group.name}</strong>
					</div>
					<div style={{ color: "#666", fontSize: "12px" }}>
						{record.group.code}
					</div>
				</div>
			),
		},
		{
			title: "Leader",
			key: "leader",
			render: (_, record) => {
				const leader = getLeaderInfo(record);
				if (!leader) return <span style={{ color: "#999" }}>No leader</span>;

				return (
					<div>
						<div>
							<strong>{leader.user.fullName}</strong>
						</div>
						<div style={{ color: "#666", fontSize: "12px" }}>
							{leader.studentCode}
						</div>
						<div style={{ color: "#666", fontSize: "12px" }}>
							{leader.user.email}
						</div>
					</div>
				);
			},
		},
		{
			title: "Created Date",
			key: "createdAt",
			dataIndex: "createdAt",
			sorter: (a, b) =>
				new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
			defaultSortOrder: "ascend" as const,
			render: (_, record) => (
				<div>
					<div>{new Date(record.createdAt).toLocaleDateString()}</div>
					<div style={{ color: "#666", fontSize: "12px" }}>
						{new Date(record.createdAt).toLocaleTimeString()}
					</div>
				</div>
			),
		},
		{
			title: "Status",
			key: "status",
			render: (_, record) => {
				const getStatusColor = (status: string) => {
					switch (status) {
						case "Approved":
							return "success";
						case "Rejected":
							return "error";
						case "Pending":
							return "warning";
						default:
							return "default";
					}
				};

				return <Tag color={getStatusColor(record.status)}>{record.status}</Tag>;
			},
		},
		{
			title: "Actions",
			key: "actions",
			align: "center",
			render: (_, record) => {
				const isPending = record.status === "Pending";

				return (
					<Space>
						<Popconfirm
							title="Approve Application"
							description="Are you sure you want to approve this thesis application?"
							onConfirm={() => handleApprove(record.groupId, record.thesisId)}
							okText="Yes, Approve"
							cancelText="Cancel"
							okButtonProps={{ loading }}
							disabled={!isPending}
						>
							<Button
								type="primary"
								icon={<CheckOutlined />}
								size="small"
								loading={loading}
								disabled={!isPending}
							>
								Approve
							</Button>
						</Popconfirm>
						<Popconfirm
							title="Reject Application"
							description="Are you sure you want to reject this thesis application?"
							onConfirm={() => handleReject(record.groupId, record.thesisId)}
							okText="Yes, Reject"
							cancelText="Cancel"
							okButtonProps={{ loading, danger: true }}
							disabled={!isPending}
						>
							<Button
								danger
								icon={<CloseOutlined />}
								size="small"
								loading={loading}
								disabled={!isPending}
							>
								Reject
							</Button>
						</Popconfirm>
					</Space>
				);
			},
		},
	];

	return (
		<Modal
			title={<Title level={4}>Thesis Requests - {thesisTitle}</Title>}
			open={open}
			onCancel={onClose}
			footer={null}
			width={1200}
			centered
		>
			{/* Search and Filter Controls */}
			<Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
				<Col span={15}>
					<Input
						placeholder="Search by group name, code, leader name, student ID or email..."
						prefix={<SearchOutlined />}
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
						allowClear
					/>
				</Col>
				<Col span={6}>
					<Select
						placeholder="Filter by Status"
						value={statusFilter}
						onChange={setStatusFilter}
						allowClear
						style={{ width: "100%" }}
					>
						<Select.Option value="Pending">Pending</Select.Option>
						<Select.Option value="Approved">Approved</Select.Option>
						<Select.Option value="Rejected">Rejected</Select.Option>
					</Select>
				</Col>
				<Col span={3}>
					<Button
						type="default"
						icon={<ReloadOutlined />}
						onClick={() => {
							setSearchText("");
							setStatusFilter(undefined);
							onRefresh?.();
						}}
						loading={dataLoading}
						block
					>
						Refresh
					</Button>
				</Col>
			</Row>

			<Table
				columns={columns}
				dataSource={filteredRequests}
				rowKey={(record) => `${record.groupId}-${record.thesisId}`}
				loading={dataLoading}
				pagination={{
					pageSize: 10,
					showSizeChanger: true,
					showQuickJumper: true,
					showTotal: (total, range) =>
						`${range[0]}-${range[1]} of ${total} requests`,
				}}
				locale={{
					emptyText: "No requests found for this thesis",
				}}
			/>
		</Modal>
	);
}
