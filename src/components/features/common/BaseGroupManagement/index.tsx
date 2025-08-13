"use client";
import React, { useCallback } from "react";
import { Space, Card } from "antd";
import { useRouter } from "next/navigation";

import { Header } from "@/components/common/Header";
import CreateForm, {
	CreateFormValues,
} from "@/components/features/admin/GroupManagement/CreateForm";
import GroupAssignTable from "@/components/features/lecturer/GroupManagement/GroupAssignTable";
import StudentFilterBar from "@/components/features/lecturer/GroupManagement/StudentFilterBar";
import StudentTable from "@/components/features/lecturer/GroupManagement/StudentTable";
import { useGroupManagement } from "@/hooks/admin/useGroupManagement";

interface BaseGroupManagementProps {
	title: string;
	description: string;
	badgeText?: string;
	showCreateForm?: boolean;
	basePath: string;
}

const BaseGroupManagement: React.FC<BaseGroupManagementProps> = ({
	title,
	description,
	badgeText,
	showCreateForm = false,
	basePath,
}) => {
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

	const handleGenerate = useCallback(
		({ semester, numberOfGroups }: CreateFormValues) => {
			// Handle group generation logic here
			console.log(`Generating ${numberOfGroups} groups for ${semester}`);
			// You can integrate this with your group creation API
		},
		[],
	);

	return (
		<Space direction="vertical" size="large" style={{ width: "100%" }}>
			<Header title={title} description={description} badgeText={badgeText} />

			{showCreateForm && <CreateForm onGenerate={handleGenerate} />}

			<GroupAssignTable
				onView={(group) => {
					router.push(`${basePath}/${group.id}`);
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

export default BaseGroupManagement;
