"use client";

import {
	CheckOutlined,
	CloseOutlined,
	ReloadOutlined,
	SearchOutlined,
} from "@ant-design/icons";
import { Button, Input, Select, Space, Table, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useMemo, useState } from "react";

import { ConfirmationModal } from "@/components/common/ConfirmModal";
import GroupDetailModal from "@/components/features/lecturer/RequestApplyThesis/GroupDetailModal";
import ThesisDetailModal from "@/components/features/lecturer/RequestApplyThesis/ThesisDetailModal";
import { formatDate } from "@/lib/utils/dateFormat";
import { ThesisApplication } from "@/lib/services/thesis-application.service";

interface Props {
	data: ThesisApplication[];
	loading?: boolean;
	onRefresh: () => void;
	updateApplicationStatus: (
		groupId: string,
		thesisId: string,
		status: "Approved" | "Rejected",
	) => Promise<void>;
}

// Status color mapping
const getStatusColor = (status: string): string => {
	switch (status) {
		case "Pending":
			return "orange";
		case "Approved":
			return "green";
		case "Rejected":
			return "red";
		case "Cancelled":
			return "gray";
		default:
			return "default";
	}
};

export default function RequestApplyThesisTable({
	data,
	loading,
	onRefresh,
	updateApplicationStatus,
}: Readonly<Props>) {
	// Filter states
	const [searchText, setSearchText] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("");

	// Modal states
	const [selectedThesis, setSelectedThesis] = useState<
		ThesisApplication["thesis"] | null
	>(null);
	const [selectedGroup, setSelectedGroup] = useState<
		ThesisApplication["group"] | null
	>(null);

	// Filter data based on search and status
	const filteredData = useMemo(() => {
		return data.filter((item) => {
			const matchesSearch =
				item.thesis.englishName
					.toLowerCase()
					.includes(searchText.toLowerCase()) ||
				item.group.name.toLowerCase().includes(searchText.toLowerCase()) ||
				item.group.code.toLowerCase().includes(searchText.toLowerCase());

			const matchesStatus = !statusFilter || item.status === statusFilter;

			return matchesSearch && matchesStatus;
		});
	}, [data, searchText, statusFilter]);

	// Handle approve application
	const handleApprove = useCallback(
		(application: ThesisApplication) => {
			ConfirmationModal.show({
				title: "Approve Application",
				message: "Are you sure you want to approve this thesis application?",
				details: `${application.group.name} - ${application.thesis.englishName}`,
				note: "This will assign the thesis to the group.",
				noteType: "info",
				okText: "Approve",
				cancelText: "Cancel",
				okType: "primary",
				onOk: async () => {
					await updateApplicationStatus(
						application.groupId,
						application.thesisId,
						"Approved",
					);
				},
			});
		},
		[updateApplicationStatus],
	);

	// Handle reject application
	const handleReject = useCallback(
		(application: ThesisApplication) => {
			ConfirmationModal.show({
				title: "Reject Application",
				message: "Are you sure you want to reject this thesis application?",
				details: `${application.group.name} - ${application.thesis.englishName}`,
				note: "The group will be notified of this decision.",
				noteType: "warning",
				okText: "Reject",
				cancelText: "Cancel",
				okType: "danger",
				onOk: async () => {
					await updateApplicationStatus(
						application.groupId,
						application.thesisId,
						"Rejected",
					);
				},
			});
		},
		[updateApplicationStatus],
	);

	// Handle view thesis detail
	const handleViewThesis = useCallback(
		(thesis: ThesisApplication["thesis"]) => {
			setSelectedThesis(thesis);
		},
		[],
	);

	// Handle view group detail
	const handleViewGroup = useCallback((group: ThesisApplication["group"]) => {
		setSelectedGroup(group);
	}, []);

	// Define table columns
	const columns: ColumnsType<ThesisApplication> = useMemo(
		() => [
			{
				title: "Thesis Name",
				dataIndex: ["thesis", "englishName"],
				key: "thesisName",
				width: "40%",
				ellipsis: {
					showTitle: false,
				},
				render: (text: string, record) => (
					<Tooltip title={text} placement="topLeft">
						<Button
							type="link"
							onClick={() => handleViewThesis(record.thesis)}
							style={{
								padding: 0,
								height: "auto",
								textAlign: "left",
								whiteSpace: "normal",
								wordBreak: "break-word",
							}}
						>
							<div
								style={{
									display: "-webkit-box",
									WebkitLineClamp: 2,
									WebkitBoxOrient: "vertical",
									overflow: "hidden",
									textOverflow: "ellipsis",
									lineHeight: "1.5",
									maxHeight: "3em",
								}}
							>
								{text}
							</div>
						</Button>
					</Tooltip>
				),
			},
			{
				title: "Group",
				key: "group",
				width: "18%",
				render: (_, record) => (
					<div>
						<Button
							type="link"
							onClick={() => handleViewGroup(record.group)}
							style={{ padding: 0, fontWeight: "bold" }}
						>
							{record.group.name}
						</Button>
						<div style={{ fontSize: "12px", color: "#666" }}>
							{record.group.code}
						</div>
					</div>
				),
			},
			{
				title: "Status",
				dataIndex: "status",
				key: "status",
				width: "10%",
				align: "center" as const,
				render: (status: string) => (
					<Tag color={getStatusColor(status)}>{status}</Tag>
				),
			},
			{
				title: "Applied Date",
				dataIndex: "createdAt",
				key: "createdAt",
				width: "17%",
				align: "center" as const,
				sorter: (a, b) =>
					new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
				render: (date: string) => formatDate(new Date(date)),
			},
			{
				title: "Actions",
				key: "actions",
				width: "15%",
				align: "center" as const,
				render: (_, record) => (
					<Space size="small">
						{record.status === "Pending" && (
							<>
								<Tooltip title="Approve">
									<Button
										icon={<CheckOutlined />}
										size="small"
										type="primary"
										onClick={() => handleApprove(record)}
									/>
								</Tooltip>
								<Tooltip title="Reject">
									<Button
										icon={<CloseOutlined />}
										size="small"
										danger
										onClick={() => handleReject(record)}
									/>
								</Tooltip>
							</>
						)}
					</Space>
				),
			},
		],
		[handleApprove, handleReject, handleViewThesis, handleViewGroup],
	);

	return (
		<div>
			{/* Search and Filter Controls */}
			<div
				style={{
					marginBottom: 16,
					display: "flex",
					gap: "12px",
					alignItems: "center",
				}}
			>
				{/* Search Input */}
				<Input
					placeholder="Search by thesis name or group name..."
					prefix={<SearchOutlined />}
					value={searchText}
					onChange={(e) => setSearchText(e.target.value)}
					style={{ flex: 1 }}
					allowClear
				/>

				{/* Status Filter */}
				<Select
					placeholder="Filter by status"
					value={statusFilter || undefined}
					onChange={(value) => setStatusFilter(value || "")}
					style={{ width: 160 }}
					allowClear
				>
					<Select.Option value="Pending">Pending</Select.Option>
					<Select.Option value="Approved">Approved</Select.Option>
					<Select.Option value="Rejected">Rejected</Select.Option>
					<Select.Option value="Cancelled">Cancelled</Select.Option>
				</Select>

				{/* Refresh Button */}
				<Button
					icon={<ReloadOutlined />}
					onClick={onRefresh}
					loading={loading}
					style={{ minWidth: 100 }}
				>
					Refresh
				</Button>
			</div>

			{/* Table */}
			<Table
				columns={columns}
				dataSource={filteredData}
				rowKey={(record) => `${record.groupId}-${record.thesisId}`}
				loading={loading}
				pagination={{
					showSizeChanger: true,
					showQuickJumper: true,
					showTotal: (total, range) =>
						`${range[0]}-${range[1]} of ${total} applications`,
					pageSizeOptions: ["10", "20", "50"],
					defaultPageSize: 20,
				}}
				scroll={{ x: 800 }}
				size="small"
			/>

			{/* Modals */}
			<ThesisDetailModal
				thesis={selectedThesis}
				open={!!selectedThesis}
				onClose={() => setSelectedThesis(null)}
			/>

			<GroupDetailModal
				group={selectedGroup}
				open={!!selectedGroup}
				onClose={() => setSelectedGroup(null)}
			/>
		</div>
	);
}
