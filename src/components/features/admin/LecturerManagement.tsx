'use client';

import { PlusOutlined } from '@ant-design/icons';
import { Button, Input, Select, Switch, Table, Tag } from 'antd';
import { useState } from 'react';

const { Option } = Select;

interface Lecturer {
	key: string;
	name: string;
	email: string;
	phoneNumber: string;
	instructionGroups: string;
	status: 'Active' | 'Inactive';
	specialPermission: boolean;
}

const initialData: Lecturer[] = [
	{
		key: '1',
		name: 'John Brown',
		email: 'john.brown@university.edu',
		phoneNumber: '0333333333',
		instructionGroups: '03',
		status: 'Active',
		specialPermission: true,
	},
	{
		key: '2',
		name: 'Sarah Wilson',
		email: 'sarah.wilson@university.edu',
		phoneNumber: '0444444444',
		instructionGroups: '03',
		status: 'Active',
		specialPermission: false,
	},
	{
		key: '3',
		name: 'Michael Chen',
		email: 'michael.chen@university.edu',
		phoneNumber: '0555555555',
		instructionGroups: '03',
		status: 'Active',
		specialPermission: false,
	},
	{
		key: '4',
		name: 'Emily Davis',
		email: 'emily.davis@university.edu',
		phoneNumber: '0666666666',
		instructionGroups: '03',
		status: 'Inactive',
		specialPermission: false,
	},
	{
		key: '5',
		name: 'David Lee',
		email: 'david.lee@university.edu',
		phoneNumber: '0888888888',
		instructionGroups: '03',
		status: 'Active',
		specialPermission: false,
	},
];

export default function LecturerManagement() {
	const [statusFilter, setStatusFilter] = useState<string>('All');
	const [searchText, setSearchText] = useState<string>('');
	const [data, setData] = useState<Lecturer[]>(initialData);

	const filteredData = data.filter((lecturer) => {
		const matchesStatus =
			statusFilter === 'All' || lecturer.status === statusFilter;
		const matchesSearch =
			lecturer.name.toLowerCase().includes(searchText.toLowerCase()) ||
			lecturer.email.toLowerCase().includes(searchText.toLowerCase());
		return matchesStatus && matchesSearch;
	});

	const handleTogglePermission = (key: string) => {
		setData((prev) =>
			prev.map((item) =>
				item.key === key
					? { ...item, specialPermission: !item.specialPermission }
					: item,
			),
		);
	};

	const columns = [
		{
			title: 'Name',
			dataIndex: 'name',
			key: 'name',
		},
		{
			title: 'Email',
			dataIndex: 'email',
			key: 'email',
		},
		{
			title: 'Phone Number',
			dataIndex: 'phoneNumber',
			key: 'phoneNumber',
			render: (text: string) => <strong>{text}</strong>,
		},
		{
			title: 'Instruction Groups',
			dataIndex: 'instructionGroups',
			key: 'instructionGroups',
		},
		{
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
			render: (status: string) => (
				<Tag color={status === 'Active' ? 'green' : 'default'}>{status}</Tag>
			),
		},
		{
			title: 'Special Permission',
			dataIndex: 'specialPermission',
			key: 'specialPermission',
			render: (_: string, record: Lecturer) => (
				<Switch
					checked={record.specialPermission}
					onChange={() => handleTogglePermission(record.key)}
				/>
			),
		},
	];

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-2xl font-semibold">Lecturers Management</h2>
				<Button icon={<PlusOutlined />} type="primary">
					Create New Lecture
				</Button>
			</div>

			<div className="flex flex-col md:flex-row gap-2 mb-4">
				<Select
					defaultValue="All"
					onChange={(value) => setStatusFilter(value)}
					className="w-full md:w-40"
				>
					<Option value="All">All Status</Option>
					<Option value="Active">Active</Option>
					<Option value="Inactive">Inactive</Option>
				</Select>
				<Input
					placeholder="Search by name, email"
					value={searchText}
					onChange={(e) => setSearchText(e.target.value)}
					className="w-full md:w-80"
				/>
			</div>

			<Table
				columns={columns}
				dataSource={filteredData}
				pagination={{ pageSize: 10 }}
				rowKey="key"
			/>
		</div>
	);
}
