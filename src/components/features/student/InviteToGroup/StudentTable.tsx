"use client";

import { SearchOutlined } from "@ant-design/icons";
import { Button, Col, Input, Row, Select, Space, Table, Tag } from "antd";
import { useState } from "react";

import { TablePagination } from "@/components/common/TablePagination";
import { mockStudents } from "@/data/student";

const { Option } = Select;

export const StudentTable = () => {
	const [searchText, setSearchText] = useState("");
	const [selectedMajor, setSelectedMajor] = useState<string | null>(null);

	const filteredStudents = mockStudents.filter((student) => {
		const matchesSearch = student.fullName
			.toLowerCase()
			.includes(searchText.toLowerCase());
		const matchesMajor = selectedMajor
			? student.majorId === selectedMajor
			: true;
		return matchesSearch && matchesMajor;
	});

	const columns = [
		{
			title: "Name",
			dataIndex: "fullName",
			key: "name",
			width: 180,
		},
		{
			title: "Email",
			dataIndex: "email",
			key: "email",
			width: 220,
		},
		{
			title: "Major",
			dataIndex: "majorId",
			key: "major",
			width: 180,
			render: (majorId: string) => {
				let majorName = majorId;
				if (majorId === "SE") {
					majorName = "Software Engineering";
				} else if (majorId === "AI") {
					majorName = "Artificial Intelligence";
				}
				return majorName;
			},
		},
		{
			title: "Role",
			dataIndex: "studentResponsibilities",
			key: "role",
			render: (roles: { responsibilityId: string; name: string }[]) => (
				<Space wrap>
					{roles.map((r) => (
						<Tag color="green" key={r.responsibilityId}>
							{r.name}
						</Tag>
					))}
				</Space>
			),
		},
		{
			title: "Action",
			key: "action",
			width: 100,
			render: () => <Button type="primary">Invite</Button>,
		},
	];

	return (
		<>
			<Row gutter={16} style={{ marginBottom: 16 }}>
				<Col flex="auto">
					<Input
						placeholder="Search by name"
						prefix={<SearchOutlined />}
						allowClear
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
						onPressEnter={(e) =>
							setSearchText((e.target as HTMLInputElement).value)
						}
					/>
				</Col>

				<Col style={{ flex: "0 0 250px" }}>
					<Select
						placeholder="Filter by Major"
						style={{ width: "100%" }}
						allowClear
						onChange={(value) => setSelectedMajor(value)}
					>
						<Option value="SE">Software Engineering</Option>
						<Option value="AI">Artificial Intelligence</Option>
					</Select>
				</Col>
			</Row>

			<Table
				columns={columns}
				dataSource={filteredStudents}
				rowKey="id"
				pagination={TablePagination}
				scroll={{ x: "max-content" }}
			/>
		</>
	);
};
