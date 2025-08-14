"use client";

import {
	DeleteOutlined,
	EyeOutlined,
	ReloadOutlined,
	SearchOutlined,
} from "@ant-design/icons";
import { Button, Input, Select, Table, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useMemo, useState } from "react";

import { ConfirmationModal } from "@/components/common/ConfirmModal";
import { useNavigationLoader } from "@/hooks/ux";
import { formatDate } from "@/lib/utils/dateFormat";
import { handleApiError } from "@/lib/utils/handleApi";
import { showNotification } from "@/lib/utils/notification";
import thesisApplicationService, {
	ThesisApplication,
} from "@/lib/services/thesis-application.service";

interface Props {
	data: ThesisApplication[];
	loading?: boolean;
	onRefresh: () => void;
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
		default:
			return "default";
	}
};

export default function ThesisApplicationTable({
	data,
	loading,
	onRefresh,
}: Readonly<Props>) {
	const { navigateWithLoading } = useNavigationLoader();
	const [cancelingId, setCancelingId] = useState<string | null>(null);

	// Filter states
	const [searchText, setSearchText] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("");

	// Filter data based on search and status
	const filteredData = useMemo(() => {
		return data.filter((item) => {
			const matchesSearch =
				item.thesis.englishName
					.toLowerCase()
					.includes(searchText.toLowerCase()) ||
				item.thesis.abbreviation
					.toLowerCase()
					.includes(searchText.toLowerCase());

			const matchesStatus = !statusFilter || item.status === statusFilter;

			return matchesSearch && matchesStatus;
		});
	}, [data, searchText, statusFilter]);

	// Handle view thesis detail
	const handleView = useCallback(
		(thesisId: string) => {
			navigateWithLoading(`/student/list-thesis/${thesisId}`);
		},
		[navigateWithLoading],
	);

	// Handle cancel application
	const handleCancel = useCallback(
		async (application: ThesisApplication) => {
			try {
				setCancelingId(application.thesisId);

				await thesisApplicationService.cancelThesisApplication(
					application.groupId,
					application.thesisId,
				);

				showNotification.success(
					"Application Canceled",
					"Your thesis application has been canceled successfully!",
				);

				// Refresh data
				onRefresh();
			} catch (error) {
				console.error("Error canceling application:", error);

				const apiError = handleApiError(
					error,
					"Failed to cancel application. Please try again.",
				);

				showNotification.error("Cancel Failed", apiError.message);
			} finally {
				setCancelingId(null);
			}
		},
		[onRefresh],
	);

	// Handle cancel application with modal confirm
	const handleCancelWithConfirm = useCallback(
		(application: ThesisApplication) => {
			ConfirmationModal.show({
				title: "Cancel Application",
				message: "Are you sure you want to cancel this thesis application?",
				details: application.thesis.englishName,
				note: "This action cannot be undone.",
				noteType: "warning",
				okText: "Yes, Cancel",
				cancelText: "No",
				okType: "danger",
				loading: cancelingId === application.thesisId,
				onOk: () => handleCancel(application),
			});
		},
		[handleCancel, cancelingId],
	);

	// Render actions column
	const renderActionsColumn = useCallback(
		(record: ThesisApplication) => {
			const isCanceling = cancelingId === record.thesisId;

			return (
				<div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
					{/* View Detail Button */}
					<Tooltip title="View Thesis Detail">
						<Button
							icon={<EyeOutlined />}
							size="small"
							onClick={() => handleView(record.thesisId)}
						/>
					</Tooltip>

					{/* Cancel Application Button - Only show for Pending status */}
					{record.status === "Pending" && (
						<Tooltip title="Cancel Application">
							<Button
								icon={<DeleteOutlined />}
								danger
								size="small"
								loading={isCanceling}
								disabled={isCanceling}
								onClick={() => handleCancelWithConfirm(record)}
							/>
						</Tooltip>
					)}
				</div>
			);
		},
		[handleView, handleCancelWithConfirm, cancelingId],
	);

	// Define table columns
	const columns: ColumnsType<ThesisApplication> = useMemo(
		() => [
			{
				title: "English Name",
				dataIndex: ["thesis", "englishName"],
				key: "englishName",
				width: "40%",
				ellipsis: {
					showTitle: false,
				},
				render: (text: string) => (
					<Tooltip title={text} placement="topLeft">
						<div
							style={{
								display: "-webkit-box",
								WebkitLineClamp: 2,
								WebkitBoxOrient: "vertical",
								overflow: "hidden",
								textOverflow: "ellipsis",
								lineHeight: "1.5",
								maxHeight: "3em",
								wordBreak: "break-word",
								whiteSpace: "normal",
							}}
						>
							{text}
						</div>
					</Tooltip>
				),
			},
			{
				title: "Abbreviation",
				dataIndex: ["thesis", "abbreviation"],
				key: "abbreviation",
				width: "15%",
				align: "center" as const,
				render: (text: string) => (
					<Tag color="blue" style={{ fontWeight: "bold" }}>
						{text}
					</Tag>
				),
			},
			{
				title: "Status",
				dataIndex: "status",
				key: "status",
				width: "12%",
				align: "center" as const,
				render: (status: string) => (
					<Tag color={getStatusColor(status)}>{status}</Tag>
				),
			},
			{
				title: "Applied Date",
				dataIndex: "createdAt",
				key: "createdAt",
				width: "15%",
				align: "center" as const,
				sorter: (a, b) =>
					new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
				render: (date: string) => formatDate(new Date(date)),
			},
			{
				title: "Actions",
				key: "actions",
				width: "18%",
				align: "center" as const,
				render: (_, record) => renderActionsColumn(record),
			},
		],
		[renderActionsColumn],
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
				{/* Search Input - flex to fill remaining space */}
				<Input
					placeholder="Search by thesis name or abbreviation..."
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
		</div>
	);
}
