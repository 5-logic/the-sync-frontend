"use client";

import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Button, Space, Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useMemo, useState } from "react";

import { ConfirmationModal } from "@/components/common/ConfirmModal";
import GroupDetailModal from "@/components/features/lecturer/RequestApplyThesis/GroupDetailModal";
import ThesisDetailModal from "@/components/features/lecturer/RequestApplyThesis/ThesisDetailModal";
import {
	SearchAndFilterControls,
	createStatusColumn,
	createAppliedDateColumn,
	getThesisApplicationTableConfig,
} from "@/components/common/ThesisApplicationTable";
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
			createStatusColumn("10%"),
			createAppliedDateColumn("17%"),
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
			<SearchAndFilterControls
				searchText={searchText}
				onSearchChange={setSearchText}
				statusFilter={statusFilter}
				onStatusFilterChange={setStatusFilter}
				onRefresh={onRefresh}
				loading={loading}
				searchPlaceholder="Search by thesis name or group name..."
				showCancelledStatus={true}
			/>

			{/* Table */}
			<Table
				columns={columns}
				dataSource={filteredData}
				rowKey={(record) => `${record.groupId}-${record.thesisId}`}
				loading={loading}
				{...getThesisApplicationTableConfig("applications")}
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
