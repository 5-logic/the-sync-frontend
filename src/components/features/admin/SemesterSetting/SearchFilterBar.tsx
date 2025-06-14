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

export default SearchFilterBar;
