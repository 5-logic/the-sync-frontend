"use client";

import { Card, Space } from "antd";
import { useRouter } from "next/navigation";

import { Header } from "@/components/common/Header";
import GroupAssignTable from "@/components/features/lecturer/GroupManagement/GroupAssignTable";
import StudentFilterBar from "@/components/features/lecturer/GroupManagement/StudentFilterBar";
import StudentTable from "@/components/features/lecturer/GroupManagement/StudentTable";
import { useGroupManagement } from "@/hooks/admin/useGroupManagement";

export default function GroupManagementPage() {
	const router = useRouter();
	const {
		filteredStudents,
		majorOptions,
		majorNamesMap,
		loading,
		majorLoading,
		studentSearch,
		setStudentSearch,
		studentMajor,
		setStudentMajor,
		handleRefresh,
	} = useGroupManagement();

	return (
		<Space direction="vertical" size="large" style={{ width: "100%" }}>
			<Header
				title="Group Management"
				description="Manage student assignments and thesis groups"
				badgeText="Moderator Only"
			/>

			<GroupAssignTable
				onView={(group) => {
					router.push(`/lecturer/group-management/${group.id}`);
				}}
				onDelete={(group) => {
					console.log("Group deleted:", group.name);
					// Optional: You can add additional logic here if needed
				}}
			/>

			<Card title="Ungrouped Students">
				<div style={{ marginBottom: 16 }}>
					<StudentFilterBar
						search={studentSearch}
						onSearchChange={setStudentSearch}
						major={studentMajor}
						onMajorChange={setStudentMajor}
						majorOptions={majorOptions}
						majorNamesMap={majorNamesMap}
						onRefresh={handleRefresh}
						loading={loading}
					/>
				</div>
				<StudentTable
					data={filteredStudents}
					majorNamesMap={majorNamesMap}
					loading={loading || majorLoading}
				/>
			</Card>
		</Space>
	);
}
