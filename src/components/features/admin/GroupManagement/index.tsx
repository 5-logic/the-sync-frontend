"use client";
import React, { useCallback } from "react";
import { Space, Card } from "antd";
import { useRouter } from "next/navigation";

import CreateForm, {
	CreateFormValues,
} from "@/components/features/admin/GroupManagement/CreateForm";
import GroupAssignTable from "@/components/features/lecturer/GroupManagement/GroupAssignTable";
import StudentFilterBar from "@/components/features/lecturer/GroupManagement/StudentFilterBar";
import StudentTable from "@/components/features/lecturer/GroupManagement/StudentTable";
import { useGroupManagement } from "@/hooks/admin/useGroupManagement";
import { useCreateGroups } from "@/hooks/admin/useCreateGroups";

const GroupManagement: React.FC = () => {
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
		semesters,
	} = useGroupManagement();

	const { createGroups, isCreating } = useCreateGroups();

	const handleGenerate = useCallback(
		async ({ semesterId, numberOfGroups }: CreateFormValues) => {
			await createGroups({
				semesterId,
				numberOfGroup: numberOfGroups,
			});
			// The hook handles all success/error notifications and data refresh
		},
		[createGroups],
	);

	return (
		<Space direction="vertical" size="large" style={{ width: "100%" }}>
			<CreateForm
				onGenerate={handleGenerate}
				loading={isCreating}
				semesters={semesters}
			/>

			<GroupAssignTable
				onView={(group) => {
					router.push(`/admin/group-management/${group.id}`);
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
};

export default GroupManagement;
