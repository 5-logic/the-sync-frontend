'use client';

import { SearchOutlined } from '@ant-design/icons';
import { Col, Input, Row, Select } from 'antd';

import { SemesterStatus, SemesterStatusSchema } from '@/schemas/_enums';

const { Option } = Select;

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
		<Row
			justify="space-between"
			align="middle"
			style={{ marginBottom: '16px' }}
		>
			<Col xs={24} sm={12}>
				<Input
					prefix={<SearchOutlined style={{ color: '#d9d9d9' }} />}
					placeholder="Search Semester"
					style={{ width: '100%', maxWidth: '320px' }}
					value={searchText}
					onChange={(e) => setSearchText(e.target.value)}
				/>
			</Col>

			<Col xs={24} sm={12}>
				<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
					<Select
						style={{ width: '100%', maxWidth: '192px' }}
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
				</div>
			</Col>
		</Row>
	);
};

export default SearchFilterBar;
