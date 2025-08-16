"use client";

import {
	CheckOutlined,
	CloseOutlined,
	EyeOutlined,
	LoadingOutlined,
} from "@ant-design/icons";
import { Button, Empty, Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
	createActionsColumn,
	createDateColumn,
	createOwnerColumn,
	createSemesterColumn,
	createStatusColumn,
	createTitleColumn,
} from "@/components/common/ThesisTableColumns";
import { ThesisConfirmationModals } from "@/components/common/ConfirmModal";
import { TablePagination } from "@/components/common/TablePagination";
import { useNavigationLoader } from "@/hooks/ux";
import {
	STATUS_COLORS,
	THESIS_STATUS,
	ThesisStatus,
} from "@/lib/constants/thesis";
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

			ThesisConfirmationModals.approve(
				async () => {
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
				},
				false,
				() => {
					// Reset loading state when user cancels
					setReviewLoadingThesisId(null);
					setReviewAction(null);
				},
			);
		},
		[reviewThesis],
	);

	const handleReject = useCallback(
		async (thesis: Thesis) => {
			setReviewLoadingThesisId(thesis.id);
			setReviewAction("reject");

			ThesisConfirmationModals.reject(
				async () => {
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
				},
				false,
				() => {
					// Reset loading state when user cancels
					setReviewLoadingThesisId(null);
					setReviewAction(null);
				},
			);
		},
		[reviewThesis],
	);

	// Type-safe color mapping for status
	const getStatusColor = useCallback((status: string): string => {
		return STATUS_COLORS[status as ThesisStatus] ?? "default";
	}, []);

	// Extract actions render logic
	const renderActionsColumn = useCallback(
		(record: Thesis) => {
			const viewPath = `/lecturer/thesis-management/${record.id}`;
			const isViewLoading = isNavigating && targetPath === viewPath;
			const isApproveLoading =
				reviewLoadingThesisId === record.id && reviewAction === "approve";
			const isRejectLoading =
				reviewLoadingThesisId === record.id && reviewAction === "reject";
			const isAnyLoading = isApproveLoading || isRejectLoading;

			return (
				<div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
					{/* View Details Button */}
					<Tooltip title="View Details">
						<Button
							icon={isViewLoading ? <LoadingOutlined spin /> : <EyeOutlined />}
							type="text"
							size="small"
							onClick={() => handleView(record.id)}
							disabled={isNavigating && !isViewLoading}
						/>
					</Tooltip>

					{/* Approve Button */}
					<Tooltip title="Approve">
						<Button
							icon={
								isApproveLoading ? <LoadingOutlined spin /> : <CheckOutlined />
							}
							type="text"
							size="small"
							onClick={() => !isAnyLoading && handleApprove(record)}
							disabled={isAnyLoading || isNavigating}
							style={{ color: "#52c41a" }}
						/>
					</Tooltip>

					{/* Reject Button */}
					<Tooltip title="Reject">
						<Button
							icon={
								isRejectLoading ? <LoadingOutlined spin /> : <CloseOutlined />
							}
							type="text"
							size="small"
							onClick={() => !isAnyLoading && handleReject(record)}
							disabled={isAnyLoading || isNavigating}
							danger
						/>
					</Tooltip>
				</div>
			);
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

	// Memoize columns to prevent unnecessary re-renders
	const columns: ColumnsType<Props["data"][number]> = useMemo(
		() => [
			createTitleColumn(),
			createOwnerColumn(getLecturerById),
			createSemesterColumn(getSemesterById, semesterLoading),
			createStatusColumn(getStatusColor),
			createDateColumn(),
			createActionsColumn(renderActionsColumn),
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
			tableLayout="auto"
			scroll={{ x: 1000 }}
			size="middle"
			locale={{
				emptyText: (
					<Empty description="No pending thesis submissions available for review" />
				),
			}}
		/>
	);
}
