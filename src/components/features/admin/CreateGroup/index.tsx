"use client";
import React, { useState } from "react";
import { Space } from "antd";
import CreateForm, { CreateFormValues } from "./CreateForm";
import GroupsTable, { AdminGroup } from "./GroupsTable";

const CreateGroups: React.FC = () => {
	const [groups, setGroups] = useState<AdminGroup[]>([
		{
			id: "G001",
			name: "Group 1",
			semester: "Fall 2025",
			members: 0,
			maxMembers: 5,
			status: "Active",
		},
		{
			id: "G002",
			name: "Group 2",
			semester: "Fall 2025",
			members: 5,
			maxMembers: 5,
			status: "Full",
		},
	]);

	const handleGenerate = ({ semester, numberOfGroups }: CreateFormValues) => {
		const startIndex = groups.length + 1;
		const newGroups: AdminGroup[] = Array.from(
			{ length: numberOfGroups },
			(_, i) => {
				const groupNumber = startIndex + i;
				return {
					id: `G${String(groupNumber).padStart(3, "0")}`,
					name: `Group ${groupNumber}`, // cố định "Group"
					semester,
					members: 0,
					maxMembers: 5, // cố định
					status: "Active",
				};
			},
		);
		setGroups((prev) => [...prev, ...newGroups]);
	};

	const handleDelete = (id: string) => {
		setGroups((prev) => prev.filter((g) => g.id !== id));
	};

	return (
		<Space direction="vertical" style={{ width: "100%" }}>
			<CreateForm onGenerate={handleGenerate} />
			<GroupsTable data={groups} onDelete={handleDelete} />
		</Space>
	);
};

export default CreateGroups;
