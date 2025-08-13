"use client";
import React, { useState, useCallback } from "react";
import { Space } from "antd";
import CreateForm, { CreateFormValues } from "./CreateForm";
import GroupsTable, { AdminGroup } from "./GroupsTable";

const CreateGroups: React.FC = () => {
	const [groups, setGroups] = useState<AdminGroup[]>([]);

	const handleGenerate = useCallback(
		({ semester, numberOfGroups }: CreateFormValues) => {
			const startIndex = groups.length + 1;
			const newGroups: AdminGroup[] = Array.from(
				{ length: numberOfGroups },
				(_, i) => {
					const groupNumber = startIndex + i;
					return {
						id: `G${String(groupNumber).padStart(3, "0")}`,
						name: `Group ${groupNumber}`,
						semester,
						members: 0,
						maxMembers: 5,
						status: "Active" as const,
					};
				},
			);
			setGroups((prev) => [...prev, ...newGroups]);
		},
		[groups.length],
	);

	const handleDelete = useCallback((id: string) => {
		setGroups((prev) => prev.filter((group) => group.id !== id));
	}, []);

	return (
		<Space direction="vertical" size="large" style={{ width: "100%" }}>
			<CreateForm onGenerate={handleGenerate} />
			<GroupsTable data={groups} onDelete={handleDelete} />
		</Space>
	);
};

export default CreateGroups;
