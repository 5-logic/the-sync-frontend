"use client";

import { EyeOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";

import { TablePagination } from "@/components/common/TablePagination";
import SemesterFilter from "@/components/features/lecturer/GroupProgess/SemesterFilter";
import MilestoneStepFilter from "@/components/features/lecturer/GroupReview/MilestoneStepFilter";
import { AssignmentReviewer } from "@/lib/services/reviews.service";
import {
	isWithinMilestonePeriod,
	testMilestonePeriod,
} from "@/lib/utils/milestoneUtils";

// Make test function available globally for debugging
if (typeof window !== "undefined") {
	(
		window as typeof window & {
			testMilestonePeriod: typeof testMilestonePeriod;
		}
	).testMilestonePeriod = testMilestonePeriod;
}

// Review group data type
export interface ReviewGroupData {
	id: string;
	code: string;
	name: string;
	projectDirection: string;
	englishName: string;
	supervisorNames: string[];
	memberCount: number;
	milestonePhase: string;
	milestoneId?: string; // Add milestone ID for filtering
	submissionId: string; // Add submission ID for review form
	thesisId: string;
	semesterId: string;
	isMainReviewer: boolean; // Add main reviewer status
	assignmentReviews: AssignmentReviewer[]; // Add assignment reviews
	createdAt: string;
	updatedAt: string;
	// Add milestone dates for time validation
	milestone?: {
		startDate: string;
		endDate: string;
	};
}

interface Props {
	data: ReviewGroupData[];
	searchText: string;
	onSearchChange: (value: string) => void;
	selectedGroup?: ReviewGroupData;
	onGroupSelect: (group: ReviewGroupData) => void;
	loading?: boolean;
	onRefresh?: () => void;
	// Filter props
	selectedSemester?: string | null;
	onSemesterChange?: (semesterId: string | null) => void;
	selectedMilestone?: string | null;
	onMilestoneChange?: (milestoneId: string | null) => void;
	showFilters?: boolean;
	// Loading synchronization
	onMilestoneLoadingChange?: (loading: boolean) => void;
	// Milestone data for time checking
	selectedMilestoneData?: {
		startDate: string;
		endDate: string;
	} | null;
}

export default function ReviewGroupSearchTable({
	searchText,
	onSearchChange,
	data,
	selectedGroup,
	onGroupSelect,
	loading = false,
	onRefresh,
	selectedSemester,
	onSemesterChange,
	selectedMilestone,
	onMilestoneChange,
	showFilters = true,
	onMilestoneLoadingChange,
	selectedMilestoneData,
}: Readonly<Props>) {
	const columns: ColumnsType<ReviewGroupData> = [
		{
			title: "Group Name",
			dataIndex: "name",
			key: "name",
			responsive: ["xs", "sm", "md", "lg", "xl"],
		},
		{
			title: "Group Code",
			dataIndex: "code",
			key: "code",
			responsive: ["sm", "md", "lg", "xl"],
		},
		{
			title: "English Name",
			key: "englishName",
			width: 500,
			responsive: ["md", "lg", "xl"],
			render: (_, record) => record.englishName || "-",
		},
		{
			title: "Project Direction",
			dataIndex: "projectDirection",
			key: "projectDirection",
			responsive: ["lg", "xl"],
			render: (value: string) => value || "-",
		},
		{
			title: "Members",
			key: "memberCount",
			responsive: ["sm", "md", "lg", "xl"],
			render: (_, record) => record.memberCount || "-",
		},

		{
			title: "Actions",
			align: "center",
			key: "actions",
			responsive: ["xs", "sm", "md", "lg", "xl"],
			width: 80,
			render: (_, record) => {
				// Check if current time is within milestone period
				// Priority: Use selected milestone data from filter if available
				let canView = false;

				if (selectedMilestone && selectedMilestoneData) {
					// Use selected milestone from filter for time checking
					canView = isWithinMilestonePeriod(
						selectedMilestoneData.startDate,
						selectedMilestoneData.endDate,
					);
				} else if (record.milestone) {
					// Fallback to record milestone
					canView = isWithinMilestonePeriod(
						record.milestone.startDate,
						record.milestone.endDate,
					);
				} else {
					// No milestone data available - allow access
					canView = true;
				}

				return (
					<Button
						type="link"
						icon={<EyeOutlined />}
						onClick={() => onGroupSelect(record)}
						disabled={!canView}
						title={
							!canView
								? "Review is only available during the milestone period"
								: "View group review"
						}
						style={{
							color: !canView ? "#d9d9d9" : undefined,
							cursor: !canView ? "not-allowed" : "pointer",
						}}
					/>
				);
			},
		},
	];

	return (
		<Space direction="vertical" size="small" style={{ width: "100%" }}>
			<div
				style={{
					display: "flex",
					gap: 8,
					marginBottom: 8,
					flexWrap: "wrap",
					alignItems: "center",
				}}
			>
				<Input
					allowClear
					prefix={<SearchOutlined />}
					placeholder="Search groups by name, english name, or project direction"
					value={searchText}
					onChange={(e) => onSearchChange(e.target.value)}
					style={{ flex: 1, minWidth: 200 }}
				/>
				{showFilters && onSemesterChange && (
					<SemesterFilter
						selectedSemester={selectedSemester || null}
						onSemesterChange={onSemesterChange}
						loading={loading}
					/>
				)}
				{onRefresh && (
					<Button
						icon={<ReloadOutlined />}
						onClick={onRefresh}
						loading={loading}
						style={{ flexShrink: 0 }}
					>
						Refresh
					</Button>
				)}
			</div>

			{/* Milestone Step Filter - Outside the search area */}
			{showFilters && onMilestoneChange && selectedSemester && (
				<MilestoneStepFilter
					selectedMilestone={selectedMilestone || null}
					onMilestoneChange={onMilestoneChange}
					semesterId={selectedSemester}
					loading={loading}
					onLoadingChange={onMilestoneLoadingChange}
				/>
			)}

			<Table
				columns={columns}
				dataSource={data}
				pagination={TablePagination}
				rowKey="id"
				loading={loading}
				rowClassName={(record) =>
					record.id === selectedGroup?.id ? "ant-table-row-selected" : ""
				}
				size="middle"
				scroll={{ x: 800 }}
				locale={{
					emptyText: loading ? "" : "No data available",
				}}
			/>
		</Space>
	);
}
