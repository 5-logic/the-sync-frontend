'use client';

import { EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Input, Select, Space, Table, Tag, Tooltip } from 'antd';
import { useState } from 'react';

const { Option } = Select;

const SEMESTER_OPTIONS = ['Spring 2025', 'Summer 2024', 'Summer 2025'];

const STATUS_COLORS: Record<string, string> = {
	Approved: 'green',
	Rejected: 'red',
	Pending: 'gold',
};

const data = [
	{
		id: '1',
		title: 'AI for Healthcare Analysis',
		semester: 'Spring 2025',
		status: 'Approved',
		date: '2024-01-10',
	},
	{
		id: '2',
		title: 'Blockchain Supply Chain',
		semester: 'Summer 2024',
		status: 'Approved',
		date: '2024-01-08',
	},
	{
		id: '3',
		title: 'Smart City IoT Platform',
		semester: 'Summer 2025',
		status: 'Rejected',
		date: '2024-01-05',
	},
	{
		id: '4',
		title: 'Smart City IoT Platform',
		semester: 'Summer 2025',
		status: 'Rejected',
		date: '2024-01-05',
	},
	{
		id: '5',
		title: 'Smart City IoT Platform',
		semester: 'Summer 2025',
		status: 'Pending',
		date: '2024-01-05',
	},
];

export default function ThesisManagement() {
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [semesterFilter, setSemesterFilter] = useState('');

	const filteredData = data.filter((item) => {
		const matchesSearch = item.title
			.toLowerCase()
			.includes(search.toLowerCase());
		const matchesStatus = statusFilter ? item.status === statusFilter : true;
		const matchesSemester = semesterFilter
			? item.semester === semesterFilter
			: true;
		return matchesSearch && matchesStatus && matchesSemester;
	});

	const columns = [
		{
			title: 'Title',
			dataIndex: 'title',
			id: 'title',
			// sorter: (a, b) => a.title.localeCompare(b.title),
		},
		{
			title: 'Semester',
			dataIndex: 'semester',
			id: 'semester',
		},
		{
			title: 'Status',
			dataIndex: 'status',
			id: 'status',
			render: (status: string) => (
				<Tag color={STATUS_COLORS[status] || 'default'}>{status}</Tag>
			),
		},
		{
			title: 'Summit date',
			dataIndex: 'date',
			id: 'date',
		},
		{
			title: 'Actions',
			id: 'actions',
			render: () => (
				<Space size="middle">
					<Tooltip title="Edit">
						<EditOutlined style={{ color: '#faad14' }} />
					</Tooltip>
					<Tooltip title="View">
						<EyeOutlined />
					</Tooltip>
				</Space>
			),
		},
	];

	return (
		<div className="px-4 py-4 sm:px-6 lg:px-8">
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-semibold">Thesis Management</h2>
				<Button icon={<PlusOutlined />} type="primary">
					Create Thesis
				</Button>
			</div>

			<div className="flex flex-wrap gap-2 mb-4">
				<Input
					placeholder="Search topics"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="w-60"
				/>
				<Select
					value={statusFilter || undefined}
					onChange={(value) => setStatusFilter(value)}
					placeholder="All Status"
					allowClear
					className="w-40"
				>
					<Option value="Approved">Approved</Option>
					<Option value="Rejected">Rejected</Option>
					<Option value="Pending">Pending</Option>
				</Select>
				<Select
					value={semesterFilter || undefined}
					onChange={(value) => setSemesterFilter(value)}
					placeholder="Semester"
					allowClear
					className="w-40"
				>
					{SEMESTER_OPTIONS.map((sem) => (
						// eslint-disable-next-line react/jsx-key
						<Option id={sem} value={sem}>
							{sem}
						</Option>
					))}
				</Select>
			</div>

			<Table
				columns={columns}
				dataSource={filteredData}
				rowKey="id"
				pagination={{
					showSizeChanger: true,
					showTotal: (total) => `Total ${total} items`,
				}}
				scroll={{ x: 'max-content' }}
			/>
		</div>
	);
}
