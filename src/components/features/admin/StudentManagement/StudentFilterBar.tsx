'use client';

import { SearchOutlined } from '@ant-design/icons';
import { Input, Select } from 'antd';

const { Option } = Select;

type Props = Readonly<{
	statusFilter: string;
	setStatusFilter: (value: string) => void;
	majorFilter: string;
	setMajorFilter: (value: string) => void;
	searchText: string;
	setSearchText: (value: string) => void;
}>;

export default function StudentFilterBar({
	statusFilter,
	setStatusFilter,
	majorFilter,
	setMajorFilter,
	searchText,
	setSearchText,
}: Props) {
	return (
		<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4 flex-wrap">
			<Select
				value={statusFilter}
				onChange={setStatusFilter}
				className="w-full md:w-40"
			>
				<Option value="All">All Status</Option>
				<Option value="Active">Active</Option>
				<Option value="Inactive">Inactive</Option>
			</Select>

			<Select
				value={majorFilter}
				onChange={setMajorFilter}
				className="w-full md:w-60"
			>
				<Option value="All">All Majors</Option>
				<Option value="SE">SE</Option>
				<Option value="AI">AI</Option>
			</Select>

			<Input
				placeholder="Search by name, email, or student ID"
				value={searchText}
				onChange={(e) => setSearchText(e.target.value)}
				prefix={<SearchOutlined className="text-gray-400" />}
				className="w-full md:w-72 flex-1"
			/>
		</div>
	);
}
