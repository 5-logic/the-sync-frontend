"use client";
import React, { useState } from "react";
import { Space } from "antd";
import GroupsTable, { Group } from "./GroupsTable";
import CreateForm, { CreateFormValues } from "./CreateForm";

const BulkCreateGroups: React.FC = () => {
	const [groups, setGroups] = useState<Group[]>([
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

	const handleGenerate = ({
		semester,
		numberOfGroups,
		maxMembers,
		prefix,
	}: CreateFormValues) => {
		const startIndex = groups.length + 1;
		const newGroups: Group[] = Array.from(
			{ length: numberOfGroups },
			(_, i) => {
				const groupNumber = startIndex + i;
				return {
					id: `G${String(groupNumber).padStart(3, "0")}`,
					name: `${prefix || "Group"} ${groupNumber}`,
					semester,
					members: 0,
					maxMembers: maxMembers || 5,
					status: "Active",
				};
			},
		);
		setGroups((prev) => [...prev, ...newGroups]);
	};

	const handleEdit = (record: Group) => {
		console.log("Edit group:", record);
	};

	const handleDelete = (id: string) => {
		setGroups((prev) => prev.filter((g) => g.id !== id));
	};

	return (
		<Space direction="vertical" style={{ width: "100%" }}>
			<CreateForm onGenerate={handleGenerate} />
			<GroupsTable data={groups} onEdit={handleEdit} onDelete={handleDelete} />
		</Space>
	);
};

export default BulkCreateGroups;
