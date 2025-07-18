'use client';

import { DownloadOutlined } from '@ant-design/icons';
import { Button, Input, Select, Space, Table, Tag } from 'antd';
import React, { useState } from 'react';

import { TablePagination } from '@/components/common/TablePagination';
import data from '@/data/thesisData';

const { Search } = Input;
const { Option } = Select;

const statusColorMap: Record<string, string> = {
	'In Progress': 'blue',
	Completed: 'green',
	'Pending Approval': 'orange',
};

const ThesisTable = () => {
	const [searchText, setSearchText] = useState('');
	const [filteredMajor, setFilteredMajor] = useState<string | null>(null);

	const handleSearch = (value: string) => {
		setSearchText(value.toLowerCase());
	};

	const handleFilterMajor = (value: string) => {
		setFilteredMajor(value);
	};

	const filteredData = data.filter((item) => {
		const matchesSearch =
			item.name.toLowerCase().includes(searchText) ||
			item.thesisName.toLowerCase().includes(searchText);
		const matchesMajor = filteredMajor ? item.major === filteredMajor : true;
		return matchesSearch && matchesMajor;
	});

	const columns = [
		{ title: 'No.', dataIndex: 'stt', key: 'stt' },
		{ title: 'Student ID', dataIndex: 'studentId', key: 'studentId' },
		{ title: 'Full Name', dataIndex: 'name', key: 'name' },
		{ title: 'Major', dataIndex: 'major', key: 'major' },
		{ title: 'Thesis Title', dataIndex: 'thesisName', key: 'thesisName' },
		{
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
			render: (status: string) => (
				<Tag color={statusColorMap[status]}>{status}</Tag>
			),
		},
		{ title: 'Supervisor', dataIndex: 'supervisor', key: 'supervisor' },
	];

	return (
		<>
			<Space style={{ marginBottom: 16 }}>
				<Search
					placeholder="Search by name or thesis title..."
					onSearch={handleSearch}
					enterButton
					allowClear
				/>
				<Select
					placeholder="Filter by major"
					onChange={handleFilterMajor}
					allowClear
					style={{ width: 200 }}
				>
					<Option value="Information Technology">Information Technology</Option>
					<Option value="Economics">Economics</Option>
					<Option value="Electronics">Electronics</Option>
				</Select>
				<Button icon={<DownloadOutlined />} type="primary">
					Export PDF
				</Button>
			</Space>
			<Table
				columns={columns}
				dataSource={filteredData}
				pagination={TablePagination}
				rowKey="studentId"
			/>
		</>
	);
};

export default ThesisTable;
