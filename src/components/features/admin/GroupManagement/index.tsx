"use client";
import React, { useCallback } from "react";
import { Space } from "antd";

import CreateForm, {
	CreateFormValues,
} from "@/components/features/admin/GroupManagement/CreateForm";
import { useGroupManagement } from "@/hooks/admin/useGroupManagement";
import { useCreateGroups } from "@/hooks/admin/useCreateGroups";
import { useGroupManagementRenderer } from "@/lib/utils/groupManagementRenderer";

const GroupManagement: React.FC = () => {
	const { semesters } = useGroupManagement();
	const { createGroups, isCreating } = useCreateGroups();
	const { renderGroupAssignTable, renderUngroupedStudentsCard } =
		useGroupManagementRenderer({
			routePrefix: "/admin",
		});

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

			{renderGroupAssignTable()}
			{renderUngroupedStudentsCard()}
		</Space>
	);
};

export default GroupManagement;
