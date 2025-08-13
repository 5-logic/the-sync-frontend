import React from "react";
import { Card, Table, Tag, Space, Button, Input } from "antd";

export interface Group {
	id: string;
	name: string;
	semester: string;
	members: number;
	maxMembers: number;
	status: "Active" | "Full";
}

interface GroupsTableProps {
	data: Group[];
	onEdit: (record: Group) => void;
	onDelete: (id: string) => void;
}

const GroupsTable: React.FC<GroupsTableProps> = ({
	data,
	onEdit,
	onDelete,
}) => {
	const columns = [
		{
			title: "Group ID",
			dataIndex: "id",
			key: "id",
		},
		{
			title: "Group Name",
			dataIndex: "name",
			key: "name",
		},
		{
			title: "Semester",
			dataIndex: "semester",
			key: "semester",
		},
		{
			title: "Members",
			key: "members",
			render: (_: unknown, record: Group) =>
				`${record.members}/${record.maxMembers}`,
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			render: (status: Group["status"]) =>
				status === "Active" ? (
					<Tag color="green">Active</Tag>
				) : (
					<Tag color="gray">Full</Tag>
				),
		},
		{
			title: "Actions",
			key: "actions",
			render: (_: unknown, record: Group) => (
				<Space>
					<Button type="link" onClick={() => onEdit(record)}>
						Edit
					</Button>
					<Button type="link" danger onClick={() => onDelete(record.id)}>
						Delete
					</Button>
				</Space>
			),
		},
	];

	return (
		<Card
			title="Available Groups"
			bordered={false}
			extra={
				<Input.Search placeholder="Search groups" style={{ width: 200 }} />
			}
		>
			<Table
				columns={columns}
				dataSource={data}
				pagination={{ pageSize: 5 }}
				rowKey="id"
				// responsive
			/>
		</Card>
	);
};

export default GroupsTable;
