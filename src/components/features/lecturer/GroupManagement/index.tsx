"use client";

import React from "react";
import BaseGroupManagement from "@/components/features/common/BaseGroupManagement";

export default function GroupManagementPage() {
	return (
		<BaseGroupManagement
			title="Group Management"
			description="Manage student assignments and thesis groups"
			badgeText="Moderator Only"
			showCreateForm={false}
			basePath="/lecturer/group-management"
		/>
	);
}
