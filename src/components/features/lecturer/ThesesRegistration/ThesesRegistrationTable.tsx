"use client";

import {
	CheckOutlined,
	CloseOutlined,
	EyeOutlined,
	LoadingOutlined,
	MoreOutlined,
} from "@ant-design/icons";
import { Button, Dropdown, Empty, Table, Tag, Tooltip } from "antd";
import type { MenuProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ThesisConfirmationModals } from "@/components/common/ConfirmModal";
import { TablePagination } from "@/components/common/TablePagination";
import { useNavigationLoader } from "@/hooks/ux";
import {
	STATUS_COLORS,
	THESIS_STATUS,
	ThesisStatus,
	UI_CONSTANTS,
} from "@/lib/constants/thesis";
import { getSemesterTagColor } from "@/lib/utils/colorUtils";
import { formatDate } from "@/lib/utils/dateFormat";
import {
	THESIS_ERROR_CONFIGS,
	THESIS_SUCCESS_CONFIGS,
	handleThesisError,
	handleThesisSuccess,
} from "@/lib/utils/thesis-handlers";
import { Thesis } from "@/schemas/thesis";
import { useLecturerStore, useSemesterStore, useThesisStore } from "@/store";

interface Props {
	data: Thesis[];
	loading?: boolean;
}

export default function ThesesRegistrationTable({
	data,
	loading,
}: Readonly<Props>) {
	const { reviewThesis } = useThesisStore();
	const { getLecturerById, fetchLecturers } = useLecturerStore();
	const {
		getSemesterById,
		fetchSemesters,
		loading: semesterLoading,
	} = useSemesterStore();
	const { isNavigating, targetPath, navigateWithLoading } =
		useNavigationLoader();

	// Loading state for approve/reject buttons
	const [reviewLoadingThesisId, setReviewLoadingThesisId] = useState<
		string | null
	>(null);
	const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(
		null,
	);

	// Filter only pending theses
	const pendingTheses = useMemo(() => {
		return data.filter((thesis) => thesis.status === THESIS_STATUS.PENDING);
	}, [data]);

	// Fetch lecturers and semesters for display
	useEffect(() => {
		fetchLecturers();
		fetchSemesters();
	}, [fetchLecturers, fetchSemesters]);

	// Memoized handlers to prevent unnecessary re-renders
	const handleView = useCallback(
		(thesisId: string) => {
			const viewPath = `/lecturer/thesis-management/${thesisId}`;
			navigateWithLoading(viewPath);
		},
		[navigateWithLoading],
	);

	const handleApprove = useCallback(
		async (thesis: Thesis) => {
			setReviewLoadingThesisId(thesis.id);
			setReviewAction("approve");

			ThesisConfirmationModals.approve(async () => {
				try {
					const success = await reviewThesis(thesis.id, "Approved");
					if (success) {
						handleThesisSuccess(THESIS_SUCCESS_CONFIGS.APPROVE);
					}
				} catch (error) {
					handleThesisError(error, THESIS_ERROR_CONFIGS.APPROVE);
				} finally {
					setReviewLoadingThesisId(null);
					setReviewAction(null);
				}
			});
		},
		[reviewThesis],
	);

	const handleReject = useCallback(
		async (thesis: Thesis) => {
			setReviewLoadingThesisId(thesis.id);
			setReviewAction("reject");

			ThesisConfirmationModals.reject(async () => {
				try {
					const success = await reviewThesis(thesis.id, "Rejected");
					if (success) {
						handleThesisSuccess(THESIS_SUCCESS_CONFIGS.REJECT);
					}
				} catch (error) {
					handleThesisError(error, THESIS_ERROR_CONFIGS.REJECT);
				} finally {
					setReviewLoadingThesisId(null);
					setReviewAction(null);
				}
			});
		},
		[reviewThesis],
	);

	// Type-safe color mapping for status
	const getStatusColor = useCallback((status: string): string => {
		return STATUS_COLORS[status as ThesisStatus] ?? "default";
	}, []);

	// Create dropdown menu items for each thesis
	const getDropdownItems = useCallback(
		(record: Thesis): MenuProps["items"] => {
			const viewPath = `/lecturer/thesis-management/${record.id}`;
			const isViewLoading = isNavigating && targetPath === viewPath;
			const isApproveLoading =
				reviewLoadingThesisId === record.id && reviewAction === "approve";
			const isRejectLoading =
				reviewLoadingThesisId === record.id && reviewAction === "reject";
			const isAnyLoading = isApproveLoading || isRejectLoading;

			return [
				{
					key: "view",
					label: "View Details",
					icon: isViewLoading ? <LoadingOutlined spin /> : <EyeOutlined />,
					onClick: () => handleView(record.id),
					disabled: isNavigating && !isViewLoading,
				},
				{
					type: "divider",
				},
				{
					key: "approve",
					label: "Approve",
					icon: isApproveLoading ? <LoadingOutlined spin /> : <CheckOutlined />,
					disabled: isAnyLoading || isNavigating,
					onClick: () => !isAnyLoading && handleApprove(record),
					style: { color: "#52c41a" },
				},
				{
					key: "reject",
					label: "Reject",
					icon: isRejectLoading ? <LoadingOutlined spin /> : <CloseOutlined />,
					danger: true,
					disabled: isAnyLoading || isNavigating,
					onClick: () => !isAnyLoading && handleReject(record),
				},
			];
		},
		[
			isNavigating,
			targetPath,
			reviewLoadingThesisId,
			reviewAction,
			handleView,
			handleApprove,
			handleReject,
		],
	);

	// Extract actions render logic
	const renderActionsColumn = useCallback(
		(record: Thesis) => {
			return (
				<div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
					{/* Dropdown Menu for View/Approve/Reject */}
					<Dropdown
						menu={{ items: getDropdownItems(record) }}
						trigger={["click"]}
						placement="bottomRight"
					>
						<Button icon={<MoreOutlined />} type="text" size="small" />
					</Dropdown>
				</div>
			);
		},
		[getDropdownItems],
	);

	// Memoize columns to prevent unnecessary re-renders
	const columns: ColumnsType<Props["data"][number]> = useMemo(
		() => [
			{
				title: "Title",
				dataIndex: "englishName",
				key: "title",
				width: UI_CONSTANTS.TABLE_WIDTHS.TITLE,
				sorter: (a, b) => a.englishName.localeCompare(b.englishName),
				ellipsis: {
					showTitle: false,
				},
				render: (text: string) => (
					<Tooltip title={text} placement="topLeft">
						<div
							style={{
								display: "-webkit-box",
								WebkitLineClamp: UI_CONSTANTS.TEXT_DISPLAY.MAX_LINES,
								WebkitBoxOrient: "vertical",
								overflow: "hidden",
								textOverflow: "ellipsis",
								lineHeight: UI_CONSTANTS.TEXT_DISPLAY.LINE_HEIGHT,
								maxHeight: UI_CONSTANTS.TEXT_DISPLAY.MAX_HEIGHT,
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
				title: "Owner",
				dataIndex: "lecturerId",
				key: "owner",
				width: UI_CONSTANTS.TABLE_WIDTHS.OWNER,
				ellipsis: {
					showTitle: false,
				},
				render: (lecturerId: string) => {
					const lecturer = getLecturerById(lecturerId);
					const displayName = lecturer?.fullName ?? "Unknown";

					return (
						<Tooltip title={displayName} placement="topLeft">
							<div
								style={{
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap",
								}}
							>
								{displayName}
							</div>
						</Tooltip>
					);
				},
			},
			{
				title: "Semester",
				dataIndex: "semesterId",
				key: "semester",
				width: UI_CONSTANTS.TABLE_WIDTHS.DOMAIN,
				align: "center" as const,
				ellipsis: {
					showTitle: false,
				},
				render: (semesterId: string) => {
					const semester = getSemesterById(semesterId);
					const displayName = semester?.name ?? "Unknown";
					const color = getSemesterTagColor(semesterId);

					// Show loading spinner while semesters are being fetched
					if (semesterLoading && !semester) {
						return (
							<div
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									height: "100%",
								}}
							>
								<LoadingOutlined spin style={{ color: "#1890ff" }} />
							</div>
						);
					}

					return (
						<div
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								height: "100%",
							}}
						>
							<Tooltip title={displayName} placement="topLeft">
								<Tag
									color={color}
									style={{
										maxWidth: "100%",
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
										display: "inline-block",
									}}
								>
									{displayName}
								</Tag>
							</Tooltip>
						</div>
					);
				},
			},
			{
				title: "Status",
				dataIndex: "status",
				key: "status",
				width: UI_CONSTANTS.TABLE_WIDTHS.STATUS,
				align: "center" as const,
				render: (status: string) => (
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							height: "100%",
						}}
					>
						<Tag color={getStatusColor(status)}>{status}</Tag>
					</div>
				),
			},
			{
				title: "Created date",
				dataIndex: "createdAt",
				key: "createdDate",
				width: UI_CONSTANTS.TABLE_WIDTHS.DATE,
				align: "center" as const,
				sorter: (a, b) =>
					new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
				render: (date: Date) => formatDate(date),
			},
			{
				title: "Actions",
				key: "actions",
				width: UI_CONSTANTS.TABLE_WIDTHS.ACTIONS,
				align: "center" as const,
				render: (_, record) => renderActionsColumn(record),
			},
		],
		[
			getLecturerById,
			getSemesterById,
			semesterLoading,
			getStatusColor,
			renderActionsColumn,
		],
	);

	return (
		<Table
			dataSource={pendingTheses}
			columns={columns}
			loading={loading}
			rowKey="id"
			pagination={TablePagination}
			scroll={{ x: "max-content" }}
			size="middle"
			locale={{
				emptyText: (
					<Empty description="No pending thesis submissions available for review" />
				),
			}}
		/>
	);
}
