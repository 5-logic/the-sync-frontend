"use client";
import React from "react";
import BaseGroupManagement from "@/components/features/common/BaseGroupManagement";

const GroupManagement: React.FC = () => {
	return (
		<BaseGroupManagement
			title="Group Management"
			description="Generate groups and manage student assignments"
			showCreateForm={true}
			basePath="/admin/group-management"
		/>
	);
};

export default GroupManagement;
