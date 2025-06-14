'use client';

import { SearchOutlined } from '@ant-design/icons';
import { Input, Select } from 'antd';

const { Option } = Select;

type SemesterStatus = 'Not yet' | 'On-going' | 'End';

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
	<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
		<Input
			prefix={<SearchOutlined className="text-gray-400" />}
			placeholder="Search"
			className="w-full sm:w-80"
			value={searchText}
			onChange={(e) => setSearchText(e.target.value)}
		/>

		<Select
			className="w-full sm:w-48"
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

export default SearchFilterBar;
