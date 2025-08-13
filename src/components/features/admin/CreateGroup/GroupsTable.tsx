import React, { useMemo, useState } from "react";
import { Card, Tag, Button, Input, Space, Col, Row, Table } from "antd";
import { DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";

import { TablePagination } from "@/components/common/TablePagination";
import { isTextMatch } from "@/lib/utils/textNormalization";

export interface AdminGroup {
	id: string;
	name: string;
	semester: string;
	members: number;
	maxMembers: number;
	status: "Active" | "Full";
}

interface GroupsTableProps {
	data: AdminGroup[];
	onDelete: (id: string) => void;
}

const GroupsTable: React.FC<GroupsTableProps> = ({ data, onDelete }) => {
	const [groupSearch, setGroupSearch] = useState("");

	const filteredGroups = useMemo(() => {
		return data.filter((group) =>
			isTextMatch(groupSearch, [group.id, group.name, group.semester]),
		);
	}, [groupSearch, data]);

	const columns: ColumnsType<AdminGroup> = useMemo(
		() => [
			{
				title: "Group code",
				dataIndex: "id",
				key: "code",
				width: "15%",
			},
			{
				title: "Group name",
				dataIndex: "name",
				key: "name",
				width: "35%",
			},
			{
				title: "Members",
				render: (_: unknown, record: AdminGroup) =>
					`${record.members}/${record.maxMembers}`,
				key: "members",
				width: "20%",
			},
			{
				title: "Status",
				render: (status: AdminGroup["status"], record: AdminGroup) =>
					record.status === "Active" ? (
						<Tag color="green">Active</Tag>
					) : (
						<Tag color="gray">Full</Tag>
					),
				key: "status",
				width: "15%",
			},
			{
				title: "Actions",
				render: (_: unknown, record: AdminGroup) => (
					<Space>
						<Button
							type="link"
							icon={<DeleteOutlined />}
							onClick={() => onDelete(record.id)}
							danger
							title="Delete Group"
						/>
					</Space>
				),
				key: "actions",
				align: "center" as const,
				width: "15%",
			},
		],
		[onDelete],
	);

	return (
		<Card title="Available Groups">
			<Row
				gutter={[16, 16]}
				align="middle"
				justify="space-between"
				style={{ marginBottom: 16 }}
			>
				<Col flex="auto">
					<Input
						allowClear
						prefix={<SearchOutlined />}
						placeholder="Search groups"
						value={groupSearch}
						onChange={(e) => setGroupSearch(e.target.value)}
					/>
				</Col>
			</Row>
			<Table
				dataSource={filteredGroups}
				columns={columns}
				rowKey="id"
				pagination={TablePagination}
				scroll={{ x: "max-content" }}
			/>
		</Card>
	);
};

export default GroupsTable;
