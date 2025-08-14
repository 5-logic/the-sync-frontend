import {
	DeleteOutlined,
	EyeOutlined,
	ReloadOutlined,
	SearchOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Input, Row, Space, Spin } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ConfirmationModal } from "@/components/common/ConfirmModal";
import groupService, { Group } from "@/lib/services/groups.service";
import { handleApiError, handleApiResponse } from "@/lib/utils/handleApi";
import { showNotification } from "@/lib/utils/notification";
import { isTextMatch } from "@/lib/utils/textNormalization";
import { useGroupsStore } from "@/store/useGroupsStore";
import { useSemesterStore } from "@/store/useSemesterStore";
import SemesterFilter from "@/components/features/lecturer/GroupProgess/SemesterFilter";

import CustomGroupTable from "./GroupTable";

interface Props {
	readonly onView?: (group: Group) => void;
	readonly onDelete?: (group: Group) => void;
}

export default function GroupAssignTable({ onView, onDelete }: Props) {
	const [groupSearch, setGroupSearch] = useState("");
	const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
	const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
	const { groups, loading, fetchGroups } = useGroupsStore();
	const { semesters, fetchSemesters } = useSemesterStore();

	useEffect(() => {
		// Fetch groups and semesters data when component mounts
		fetchGroups();
		fetchSemesters();
	}, [fetchGroups, fetchSemesters]);

	// Auto-select first available semester (not NotYet or End) if none selected
	useEffect(() => {
		if (!selectedSemester && semesters.length > 0) {
			const availableSemesters = semesters.filter(
				(semester) => semester.status !== "NotYet" && semester.status !== "End",
			);
			if (availableSemesters.length > 0) {
				setSelectedSemester(availableSemesters[0].id);
			}
		}
	}, [selectedSemester, semesters]);

	const handleRefresh = () => {
		useGroupsStore.getState().refetch(); // Use refetch method for forced refresh
	};

	const handleDeleteGroup = useCallback(
		async (group: Group) => {
			try {
				setDeleteLoading(group.id);

				const response = await groupService.deleteGroup(group.id);
				const result = handleApiResponse(response);

				if (result.success) {
					showNotification.success(
						"Group Deleted",
						`Group "${group.name}" has been deleted successfully!`,
					);
					handleRefresh(); // Refresh the groups list
					onDelete?.(group); // Call optional callback
				} else {
					// Handle API response error (when success: false)
					showNotification.error(
						"Delete Failed",
						result.error?.message || "Failed to delete group",
					);
				}
			} catch (error) {
				// Handle actual errors (network, server errors, etc.)
				const { message } = handleApiError(error, "Failed to delete group");
				showNotification.error("Delete Failed", message);
			} finally {
				setDeleteLoading(null);
			}
		},
		[onDelete],
	);

	const showDeleteConfirm = useCallback(
		(group: Group) => {
			ConfirmationModal.show({
				title: "Delete Group",
				message: "Are you sure you want to delete this group?",
				details: `${group.name} (${group.code})`,
				note: "This action cannot be undone. All group data will be permanently deleted.",
				noteType: "danger",
				okText: "Yes, Delete",
				okType: "danger",
				onOk: () => handleDeleteGroup(group),
				loading: deleteLoading === group.id,
			});
		},
		[deleteLoading, handleDeleteGroup],
	);

	const filteredGroups = useMemo(() => {
		return groups
			.filter((group) => {
				// Filter by selected semester if available
				if (selectedSemester && group.semester.id !== selectedSemester) {
					return false;
				}
				// If no semester selected, show groups from semesters that are not NotYet or End
				if (!selectedSemester) {
					return (
						group.semester.status !== "NotYet" &&
						group.semester.status !== "End"
					);
				}
				return true;
			})
			.sort((a, b) => a.memberCount - b.memberCount) // Sort by members ascending
			.filter((group) =>
				isTextMatch(groupSearch, [
					group.code,
					group.name,
					group.leader?.student?.user?.fullName,
				]),
			);
	}, [groupSearch, groups, selectedSemester]);

	const groupColumns = useMemo(() => {
		return [
			{
				title: "Group code",
				dataIndex: "code",
				key: "code",
				width: "15%",
			},
			{
				title: "Group name",
				dataIndex: "name",
				key: "name",
				width: "35%",
			},
			{
				title: "Members",
				dataIndex: "memberCount",
				key: "members",
				width: "20%",
			},
			{
				title: "Leader",
				render: (_: unknown, record: Group) =>
					record.leader?.student?.user?.fullName || "No leader",
				key: "leader",
				width: "20%",
			},
			{
				title: "Actions",
				render: (_: unknown, record: Group) => (
					<Space>
						<Button
							type="link"
							icon={<EyeOutlined />}
							onClick={() => {
								onView?.(record);
							}}
							title="View Details"
						/>
						<Button
							type="link"
							icon={<DeleteOutlined />}
							onClick={() => showDeleteConfirm(record)}
							loading={deleteLoading === record.id}
							danger
							title="Delete Group"
						/>
					</Space>
				),
				key: "actions",
				align: "center" as const,
				width: "15%",
			},
		];
	}, [onView, deleteLoading, showDeleteConfirm]);

	return (
		<Card title="Active Groups">
			<Row
				gutter={[16, 16]}
				align="middle"
				justify="space-between"
				style={{ marginBottom: 16 }}
			>
				<Col flex="auto">
					<Input
						allowClear
						prefix={<SearchOutlined />}
						placeholder="Search groups"
						value={groupSearch}
						onChange={(e) => setGroupSearch(e.target.value)}
					/>
				</Col>
				<Col flex="none">
					<SemesterFilter
						selectedSemester={selectedSemester}
						onSemesterChange={setSelectedSemester}
						loading={loading}
					/>
				</Col>
				<Col flex="none">
					<Button
						icon={<ReloadOutlined />}
						onClick={handleRefresh}
						type="default"
						loading={loading} // Match loading state
					>
						Refresh
					</Button>
				</Col>
			</Row>
			<Spin spinning={loading} tip="Loading groups...">
				<CustomGroupTable data={filteredGroups} columns={groupColumns} />
			</Spin>
		</Card>
	);
}
