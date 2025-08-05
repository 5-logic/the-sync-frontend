"use client";

import { EyeOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Empty, Input, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";

import { TablePagination } from "@/components/common/TablePagination";
import SemesterFilter from "@/components/features/lecturer/GroupProgess/SemesterFilter";
import type { FullMockGroup } from "@/data/group";
import { Group, SupervisedGroup } from "@/lib/services/groups.service";

// Union type to support both real API data and mock data
type GroupData = Group | FullMockGroup | SupervisedGroup;

interface Props<T extends GroupData = SupervisedGroup> {
	data: T[];
	searchText: string;
	onSearchChange: (value: string) => void;
	selectedGroup?: T;
	onGroupSelect: (group: T) => void;
	loading?: boolean;
	onRefresh?: () => void;
	// Semester filter props
	selectedSemester?: string | null;
	onSemesterChange?: (semesterId: string | null) => void;
	showSemesterFilter?: boolean;
}

export default function GroupSearchTable<
	T extends GroupData = SupervisedGroup,
>({
	searchText,
	onSearchChange,
	data,
	selectedGroup,
	onGroupSelect,
	loading = false,
	onRefresh,
	selectedSemester,
	onSemesterChange,
	showSemesterFilter = false,
}: Readonly<Props<T>>) {
	const columns: ColumnsType<T> = [
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
			render: (_, record) => {
				// Handle SupervisedGroup type with thesis.englishName
				if ("thesis" in record && record.thesis?.englishName) {
					return record.thesis.englishName;
				}
				// Handle FullMockGroup type with englishName property
				if ("englishName" in record && record.englishName) {
					return record.englishName;
				}
				return "-";
			},
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
			render: (_, record) => {
				// Handle SupervisedGroup type with studentGroupParticipations
				if (
					"studentGroupParticipations" in record &&
					Array.isArray(record.studentGroupParticipations)
				) {
					return record.studentGroupParticipations.length;
				}
				// Handle Group type with memberCount
				if ("memberCount" in record) {
					return record.memberCount;
				}
				// Handle FullMockGroup type with members array
				if ("members" in record && Array.isArray(record.members)) {
					return record.members.length;
				}
				return "-";
			},
		},

		{
			title: "Actions",
			align: "center",
			key: "actions",
			responsive: ["xs", "sm", "md", "lg", "xl"],
			width: 80,
			render: (_, record) => (
				<Button
					type="link"
					icon={<EyeOutlined />}
					onClick={() => onGroupSelect(record)}
				></Button>
			),
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
					placeholder="Search groups by name or project direction"
					value={searchText}
					onChange={(e) => onSearchChange(e.target.value)}
					style={{ flex: 1, minWidth: 200 }}
				/>
				{showSemesterFilter && onSemesterChange && (
					<SemesterFilter
						selectedSemester={selectedSemester || null}
						onSemesterChange={onSemesterChange}
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
				scroll={{ x: 800 }} // Enable horizontal scroll on small screens
				locale={{
					emptyText: (
						<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No data" />
					),
				}}
			/>
		</Space>
	);
}
