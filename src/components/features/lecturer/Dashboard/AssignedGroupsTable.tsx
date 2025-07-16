import { Card, Input, Select, Table } from 'antd';
import React, { useState } from 'react';

import { TablePagination } from '@/components/common/TablePagination';
import { allMockGroups } from '@/data/group';

const { Search } = Input;
const { Option } = Select;

const AssignedGroupsTable: React.FC = () => {
	const [searchText, setSearchText] = useState('');
	const [semester, setSemester] = useState('All');

	const filteredData = allMockGroups.filter((group) => {
		const matchSemester = semester === 'All' || group.semesterId === semester;
		const searchLower = searchText.toLowerCase();
		return (
			matchSemester &&
			(group.name.toLowerCase().includes(searchLower) ||
				group.leader.toLowerCase().includes(searchLower) ||
				group.title.toLowerCase().includes(searchLower))
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
			render: () => <span style={{ cursor: 'pointer' }}>👁️</span>,
		},
	];

	return (
		<Card title="Assigned Groups">
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					marginBottom: 16,
				}}
			>
				<Search
					placeholder="Search thesis, group, leader"
					value={searchText}
					onChange={(e) => setSearchText(e.target.value)}
					style={{ width: '60%' }}
				/>
				<Select value={semester} onChange={setSemester} style={{ width: 150 }}>
					<Option value="All">All Semester</Option>
					<Option value="2023">2023</Option>
					<Option value="2024">2024</Option>
				</Select>
			</div>
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
