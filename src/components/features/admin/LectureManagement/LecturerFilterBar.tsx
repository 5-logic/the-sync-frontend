'use client';

import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Input, Select } from 'antd';

const { Option } = Select;

type Props = Readonly<{
	statusFilter: string;
	setStatusFilter: (value: string) => void;
	searchText: string;
	setSearchText: (value: string) => void;
	onCreateLecturer: () => void;
}>;

export default function LecturerFilterBar({
	statusFilter,
	setStatusFilter,
	searchText,
	setSearchText,
	onCreateLecturer,
}: Props) {
	return (
		<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4 flex-wrap">
			<div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
				<Select
					value={statusFilter}
					onChange={setStatusFilter}
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
					prefix={<SearchOutlined className="text-gray-400" />}
					className="w-full md:w-60 flex-1"
				/>
			</div>

			<Button
				icon={<PlusOutlined />}
				type="primary"
				className="w-full md:w-auto"
				onClick={onCreateLecturer}
			>
				Create New Lecturer
			</Button>
		</div>
	);
}
