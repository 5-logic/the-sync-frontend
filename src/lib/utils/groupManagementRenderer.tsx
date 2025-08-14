import React from "react";
import { Card } from "antd";
import { useRouter } from "next/navigation";
import GroupAssignTable from "@/components/features/lecturer/GroupManagement/GroupAssignTable";
import StudentFilterBar from "@/components/features/lecturer/GroupManagement/StudentFilterBar";
import StudentTable from "@/components/features/lecturer/GroupManagement/StudentTable";
import { useGroupManagement } from "@/hooks/admin/useGroupManagement";

interface GroupManagementRendererProps {
	routePrefix: string;
}

/**
 * Utility function to render shared group management components
 * Helps reduce code duplication between admin and lecturer components
 */
export const useGroupManagementRenderer = ({
	routePrefix,
}: GroupManagementRendererProps) => {
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

	const renderGroupAssignTable = () => (
		<GroupAssignTable
			onView={(group) => {
				router.push(`${routePrefix}/group-management/${group.id}`);
			}}
			onDelete={(group) => {
				console.log("Group deleted:", group.name);
				// Optional: You can add additional logic here if needed
			}}
		/>
	);

	const renderUngroupedStudentsCard = () => (
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
	);

	return {
		renderGroupAssignTable,
		renderUngroupedStudentsCard,
		// Expose data if needed
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
	};
};
