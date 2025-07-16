import { EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { Card, Col, Input, Row, Select, Table, Tooltip } from 'antd';
import React, { useState } from 'react';

import { TablePagination } from '@/components/common/TablePagination';
import { allMockGroups } from '@/data/group';

const { Search } = Input;
const { Option } = Select;

const AssignedGroupsTable: React.FC = () => {
	const [searchText, setSearchText] = useState('');
	const [semester, setSemester] = useState('All');

	// Remove duplicate groups by id
	const uniqueGroups = Array.from(
		new Map(allMockGroups.map((group) => [group.id, group])).values(),
	);

	const filteredData = uniqueGroups.filter((group) => {
		const matchSemester = semester === 'All' || group.semesterId === semester;
		const lowerSearch = searchText.toLowerCase();
		return (
			matchSemester &&
			(group.name?.toLowerCase().includes(lowerSearch) ||
				group.leader?.toLowerCase().includes(lowerSearch) ||
				group.title?.toLowerCase().includes(lowerSearch))
		);
	});

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
			render: () => (
				<Tooltip title="View Details">
					<EyeOutlined
						style={{ fontSize: 18, cursor: 'pointer', color: '#1890ff' }}
					/>
				</Tooltip>
			),
		},
	];

	return (
		<Card title="Assigned Groups">
			<Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
				<Col xs={24} md={16}>
					<Search
						allowClear
						prefix={<SearchOutlined />}
						placeholder="Search thesis, group, leader"
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
					/>
				</Col>
				<Col xs={24} md={8}>
					<Select
						value={semester}
						onChange={setSemester}
						style={{ width: '100%' }}
					>
						<Option value="All">All Semesters</Option>
						<Option value="2023">2023</Option>
						<Option value="2024">2024</Option>
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
