import { EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Col, Input, Row, Select, Table, Tooltip } from 'antd';
import React, { useState } from 'react';

import { TablePagination } from '@/components/common/TablePagination';
import { allMockGroups } from '@/data/group';

const { Option } = Select;

const AssignedGroupsTable: React.FC = () => {
	const [searchText, setSearchText] = useState('');
	const [semester, setSemester] = useState('All');

	// Remove duplicate groups by id
	const uniqueGroups = Array.from(
		new Map(allMockGroups.map((group) => [group.id, group])).values(),
	);

	// Get unique semesters from data
	const uniqueSemesters = Array.from(
		new Set(uniqueGroups.map((group) => group.semesterId)),
	).sort();

	// Filter data
	const filteredData = uniqueGroups.filter((group) => {
		// Exact match for semester or "All"
		const matchSemester = semester === 'All' || group.semesterId === semester;
		const lowerSearch = searchText.toLowerCase();
		return (
			matchSemester &&
			(group.name?.toLowerCase().includes(lowerSearch) ||
				group.leader?.toLowerCase().includes(lowerSearch) ||
				group.title?.toLowerCase().includes(lowerSearch) ||
				group.members?.some((member) =>
					member.toLowerCase().includes(lowerSearch),
				))
		);
	});

	// Table columns
	const columns = [
		{
			title: 'Group Name',
			dataIndex: 'name',
			key: 'name',
		},
		{
			title: 'Group Leader',
			dataIndex: 'leader',
			key: 'leader',
		},
		{
			title: 'Thesis Title',
			dataIndex: 'title',
			key: 'title',
		},
		{
			title: 'Semester',
			dataIndex: 'semesterId',
			key: 'semesterId',
		},
		{
			title: 'Actions',
			key: 'actions',
			render: (_: unknown, record: unknown) => (
				<Tooltip title="View Details">
					<Button
						type="link"
						icon={<EyeOutlined />}
						onClick={() => {
							// Gọi logic khi click nếu cần
							console.log('View', record);
						}}
					/>
				</Tooltip>
			),
		},
	];

	return (
		<Card title="Assigned Groups">
			<Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
				<Col flex="auto">
					<Input
						allowClear
						prefix={<SearchOutlined />}
						placeholder="Search thesis, group, leader"
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
					/>
				</Col>
				<Col flex="200px">
					<Select
						value={semester}
						onChange={setSemester}
						style={{ width: '100%' }}
					>
						<Option value="All">All Semesters</Option>
						{uniqueSemesters.map((sem) => (
							<Option key={sem} value={sem}>
								{sem}
							</Option>
						))}
					</Select>
				</Col>
			</Row>

			<Table
				columns={columns}
				dataSource={filteredData}
				rowKey="id"
				pagination={TablePagination}
				scroll={{ x: 'max-content' }}
			/>
		</Card>
	);
};

export default AssignedGroupsTable;
