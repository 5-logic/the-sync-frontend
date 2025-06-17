'use client';

import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, Input, Row, Select } from 'antd';

import { SemesterStatus, SemesterStatusSchema } from '@/schemas/_enums';

const { Option } = Select;

const SearchFilterBar = ({
	statusFilter,
	setStatusFilter,
	searchText,
	setSearchText,
	onRefresh,
	loading,
}: {
	statusFilter: SemesterStatus | 'All';
	setStatusFilter: (value: SemesterStatus | 'All') => void;
	searchText: string;
	setSearchText: (value: string) => void;
	onRefresh: () => void;
	loading?: boolean;
}) => {
	const getStatusLabel = (status: SemesterStatus): string => {
		const statusLabels: Record<SemesterStatus, string> = {
			NotYet: 'Not Yet',
			Preparing: 'Preparing',
			Picking: 'Picking',
			Ongoing: 'Ongoing',
			End: 'End',
		};
		return statusLabels[status];
	};

	return (
		<Row gutter={16} style={{ marginBottom: '16px' }}>
			<Col flex="auto">
				<Input
					prefix={<SearchOutlined style={{ color: '#d9d9d9' }} />}
					placeholder="Search Semester"
					value={searchText}
					onChange={(e) => setSearchText(e.target.value)}
				/>
			</Col>
			<Col flex="192px">
				<Select
					style={{ width: '100%' }}
					value={statusFilter}
					onChange={setStatusFilter}
				>
					<Option value="All">All Status</Option>
					{SemesterStatusSchema.options.map((status) => (
						<Option key={status} value={status}>
							{getStatusLabel(status)}
						</Option>
					))}
				</Select>
			</Col>
			<Col flex="none">
				<Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading}>
					Refresh
				</Button>
			</Col>
		</Row>
	);
};

export default SearchFilterBar;
