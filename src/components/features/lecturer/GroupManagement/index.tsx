"use client";

import React from "react";
import { Space } from "antd";
import { Header } from "@/components/common/Header";
import { useGroupManagementRenderer } from "@/lib/utils/groupManagementRenderer";

export default function GroupManagementPage() {
	const { renderGroupAssignTable, renderUngroupedStudentsCard } =
		useGroupManagementRenderer({
			routePrefix: "/lecturer",
		});

	return (
		<Space direction="vertical" size="large" style={{ width: "100%" }}>
			<Header
				title="Group Management"
				description="Manage student assignments and thesis groups"
				badgeText="Moderator Only"
			/>

			{renderGroupAssignTable()}
			{renderUngroupedStudentsCard()}
		</Space>
	);
}
