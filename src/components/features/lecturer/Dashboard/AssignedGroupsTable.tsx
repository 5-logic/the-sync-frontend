// components/AssignedGroupsTable.tsx
import { Input, Select, Table } from 'antd';
import React, { useState } from 'react';

const { Search } = Input;
const { Option } = Select;

const AssignedGroupsTable: React.FC = () => {
	const [searchText, setSearchText] = useState('');
	const [semester, setSemester] = useState('All');

	const dataSource = [
		{
			key: '1',
			groupName: 'Team Innovation',
			groupLeader: 'John Anderson',
			thesisTitle: 'AI-Powered Smart Campus Navigation System',
			semester: 'Spring 2024',
		},
		{
			key: '2',
			groupName: 'BlockChain Masters',
			groupLeader: 'Emily Chen',
			thesisTitle: 'Blockchain-based Academic Credential Verification',
			semester: 'Spring 2024',
		},
		{
			key: '3',
			groupName: 'IoT Pioneers',
			groupLeader: 'Michael Brown',
			thesisTitle: 'IoT Environmental Monitoring System',
			semester: 'Fall 2023',
		},
	];

	const filteredData = dataSource.filter(
		(item) =>
			(semester === 'All' || item.semester === semester) &&
			(item.groupName.toLowerCase().includes(searchText.toLowerCase()) ||
				item.groupLeader.toLowerCase().includes(searchText.toLowerCase()) ||
				item.thesisTitle.toLowerCase().includes(searchText.toLowerCase())),
	);

	const columns = [
		{
			title: 'Group Name',
			dataIndex: 'groupName',
			key: 'groupName',
		},
		{
			title: 'Group Leader',
			dataIndex: 'groupLeader',
			key: 'groupLeader',
		},
		{
			title: 'Thesis Title',
			dataIndex: 'thesisTitle',
			key: 'thesisTitle',
		},
		{
			title: 'Semester',
			dataIndex: 'semester',
			key: 'semester',
		},
		{
			title: 'Actions',
			key: 'actions',
			render: () => <span style={{ cursor: 'pointer' }}>👁️</span>,
		},
	];

	return (
		<div>
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
					<Option value="Spring 2024">Spring 2024</Option>
					<Option value="Fall 2023">Fall 2023</Option>
				</Select>
			</div>
			<Table
				columns={columns}
				dataSource={filteredData}
				pagination={{ pageSize: 5 }}
				scroll={{ x: 'max-content' }}
			/>
		</div>
	);
};

export default AssignedGroupsTable;
