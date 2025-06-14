'use client';

import {
	DeleteOutlined,
	EditOutlined,
	SearchOutlined,
} from '@ant-design/icons';
import { Button, Form, Input, Select, Space, Table, Tag, Tooltip } from 'antd';
import type { FormInstance } from 'antd/es/form';
import { useState } from 'react';

const { Option } = Select;

// ----------------------- Type ----------------------- //

type SemesterStatus = 'Not yet' | 'On-going' | 'End';

interface SemesterData {
	key: string;
	name: string;
	code: string;
	maxGroup: number;
	status: SemesterStatus;
}

// ----------------------- Components ----------------------- //

const SemesterForm = ({ form }: { form: FormInstance }) => (
	<div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
		<h2 className="text-lg font-semibold mb-4">Add New Semester</h2>
		<Form form={form} layout="vertical">
			{/* Hàng 1: Season & Year */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Form.Item
					name="season"
					label={
						<span>
							Season <span className="text-red-500">*</span>
						</span>
					}
					rules={[{ required: true, message: 'Season is required' }]}
					required={false}
				>
					<Select placeholder="Select the season of semester">
						<Option value="Spring">Spring</Option>
						<Option value="Summer">Summer</Option>
						<Option value="Fall">Fall</Option>
					</Select>
				</Form.Item>

				<Form.Item
					name="year"
					label={
						<span>
							Year <span className="text-red-500">*</span>
						</span>
					}
					rules={[{ required: true, message: 'Year is required' }]}
					required={false}
				>
					<Select placeholder="Select the year for semester">
						<Option value="2025">2025</Option>
						<Option value="2026">2026</Option>
						<Option value="2027">2027</Option>
					</Select>
				</Form.Item>
			</div>

			{/* Hàng 2: Title + Max Group */}
			<div className="mt-4">
				<h3 className="text-base font-medium mb-2">Semester Policy</h3>
				<Form.Item name="maxGroup" label="Max Group">
					<Input placeholder="Enter maximum number of groups" type="number" />
				</Form.Item>
			</div>

			{/* Nút hành động */}
			<div className="flex justify-end space-x-2">
				<Button onClick={() => form.resetFields()}>Clear Form</Button>
				<Button type="primary" htmlType="submit">
					Save Semester
				</Button>
			</div>
		</Form>
	</div>
);

const SearchFilterBar = ({
	statusFilter,
	setStatusFilter,
	searchText,
	setSearchText,
}: {
	statusFilter: SemesterStatus | 'All';
	setStatusFilter: (value: SemesterStatus | 'All') => void;
	searchText: string;
	setSearchText: (value: string) => void;
}) => (
	<div className="flex items-center justify-between mb-4">
		<Input
			prefix={<SearchOutlined className="text-gray-400" />}
			placeholder="Search"
			className="w-28"
			style={{ width: '300px' }}
			value={searchText}
			onChange={(e) => setSearchText(e.target.value)}
		/>

		<Select
			style={{ width: 150 }}
			value={statusFilter}
			onChange={setStatusFilter}
		>
			<Option value="All">All Status</Option>
			<Option value="Not yet">Not yet</Option>
			<Option value="On-going">On-going</Option>
			<Option value="End">End</Option>
		</Select>
	</div>
);

const SemesterTable = ({
	statusFilter,
	searchText,
}: {
	statusFilter: SemesterStatus | 'All';
	searchText: string;
}) => {
	const data: SemesterData[] = [
		{
			key: '1',
			name: 'Fall 2025',
			code: 'FA25',
			maxGroup: 15,
			status: 'Not yet',
		},
		{
			key: '2',
			name: 'Summer 2025',
			code: 'SU25',
			maxGroup: 15,
			status: 'On-going',
		},
		{
			key: '3',
			name: 'Spring 2025',
			code: 'SP25',
			maxGroup: 15,
			status: 'End',
		},
	];

	const statusTag: Record<SemesterStatus, JSX.Element> = {
		'Not yet': <Tag color="blue">Not yet</Tag>,
		'On-going': <Tag color="green">On-going</Tag>,
		End: <Tag color="gray">End</Tag>,
	};

	// ✅ Lọc dữ liệu theo status và searchText
	const filteredData = data.filter((item) => {
		const matchStatus = statusFilter === 'All' || item.status === statusFilter;
		const matchSearch = item.name
			.toLowerCase()
			.includes(searchText.toLowerCase());
		return matchStatus && matchSearch;
	});

	const columns = [
		{ title: 'Semester Name', dataIndex: 'name', key: 'name' },
		{ title: 'Semester Code', dataIndex: 'code', key: 'code' },
		{ title: 'Max group', dataIndex: 'maxGroup', key: 'maxGroup' },
		{
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
			render: (status: SemesterStatus) => statusTag[status] || status,
		},
		{
			title: 'Actions',
			key: 'actions',
			render: () => (
				<Space size="middle">
					<Tooltip title="Edit">
						<Button icon={<EditOutlined />} size="small" type="text" />
					</Tooltip>
					<Tooltip title="Delete">
						<Button icon={<DeleteOutlined />} size="small" danger type="text" />
					</Tooltip>
				</Space>
			),
		},
	];

	return (
		<Table
			columns={columns}
			dataSource={filteredData}
			pagination={{
				pageSize: 10,
				showTotal: (total) => `Total ${total} items`,
			}}
		/>
	);
};

// ----------------------- Main Page ----------------------- //

export default function SemesterSettings() {
	const [form] = Form.useForm();
	const [statusFilter, setStatusFilter] = useState<SemesterStatus | 'All'>(
		'All',
	);
	const [searchText, setSearchText] = useState<string>('');

	return (
		<div className="p-6">
			<h1 className="text-2xl font-semibold mb-1">
				Semester & Academic Settings
			</h1>
			<p className="text-gray-500 mb-6">
				Create and manage semesters, registration windows, and capstone-specific
				rules
			</p>

			<SemesterForm form={form} />

			<SearchFilterBar
				statusFilter={statusFilter}
				setStatusFilter={setStatusFilter}
				searchText={searchText}
				setSearchText={setSearchText}
			/>

			<SemesterTable statusFilter={statusFilter} searchText={searchText} />
		</div>
	);
}
