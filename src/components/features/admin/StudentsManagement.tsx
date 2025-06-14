'use client';

import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Input, Select, Table, Tag } from 'antd';
import { useState } from 'react';

const { Option } = Select;

interface Student {
	key: string;
	name: string;
	email: string;
	studentID: string;
	major: string;
	gender: 'Male' | 'Female';
	status: 'Active' | 'Inactive';
}

const initialData: Student[] = [
	{
		key: '1',
		name: 'Alice Nguyen',
		email: 'alice.nguyen@student.edu',
		studentID: 'ST0001',
		major: 'SE',
		gender: 'Female',
		status: 'Active',
	},
	{
		key: '2',
		name: 'Bob Tran',
		email: 'bob.tran@student.edu',
		studentID: 'ST0002',
		major: 'AI',
		gender: 'Male',
		status: 'Inactive',
	},
];

export default function StudentManagement() {
	const [statusFilter, setStatusFilter] = useState<string>('All');
	const [majorFilter, setMajorFilter] = useState<string>('All');
	const [searchText, setSearchText] = useState<string>('');
	const [data] = useState<Student[]>(initialData);

	const filteredData = data.filter((student) => {
		const matchesStatus =
			statusFilter === 'All' || student.status === statusFilter;

		const matchesMajor = majorFilter === 'All' || student.major === majorFilter;

		const matchesSearch =
			student.name.toLowerCase().includes(searchText.toLowerCase()) ||
			student.email.toLowerCase().includes(searchText.toLowerCase()) ||
			student.studentID.toLowerCase().includes(searchText.toLowerCase());

		return matchesStatus && matchesMajor && matchesSearch;
	});

	const columns = [
		{ title: 'Name', dataIndex: 'name', key: 'name' },
		{ title: 'Email', dataIndex: 'email', key: 'email' },
		{ title: 'Student ID', dataIndex: 'studentID', key: 'studentID' },
		{ title: 'Major', dataIndex: 'major', key: 'major' },
		{ title: 'Gender', dataIndex: 'gender', key: 'gender' },
		{
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
			render: (status: string) => (
				<Tag color={status === 'Active' ? 'green' : 'default'}>{status}</Tag>
			),
		},
	];

	return (
		<div className="p-6">
			{/* Tiêu đề */}
			<div className="mb-4">
				<h2 className="text-2xl font-semibold">Student Management</h2>
			</div>

			{/* Thanh điều khiển: Search, Filter, Create Button */}
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4 flex-wrap">
				<div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
					{/* Filter by status */}
					<Select
						defaultValue="All"
						onChange={(value) => setStatusFilter(value)}
						className="w-full md:w-40"
					>
						<Option value="All">All Status</Option>
						<Option value="Active">Active</Option>
						<Option value="Inactive">Inactive</Option>
					</Select>

					{/* Filter by major */}
					<Select
						defaultValue="All"
						onChange={(value) => setMajorFilter(value)}
						className="w-full md:w-60"
					>
						<Option value="All">All Majors</Option>
						<Option value="SE">SE</Option>
						<Option value="AI">AI</Option>
					</Select>

					{/* Search input */}
					<Input
						placeholder="Search by name, email, or student ID"
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
						prefix={<SearchOutlined className="text-gray-400" />}
						className="w-full md:w-72"
					/>
				</div>

				<Button
					icon={<PlusOutlined />}
					type="primary"
					className="w-full md:w-auto"
				>
					Create New Student
				</Button>
			</div>

			{/* Bảng dữ liệu */}
			<Table
				columns={columns}
				dataSource={filteredData}
				pagination={{ pageSize: 10 }}
				rowKey="key"
			/>
		</div>
	);
}
