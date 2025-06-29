'use client';

import { SearchOutlined } from '@ant-design/icons';
import { Col, Input, Row, Select } from 'antd';

interface Filters {
	englishName?: string;
	isPublish?: boolean;
}

interface Props {
	currentFilters: Filters;
	onFilterChange: (filters: Filters) => void;
}

export default function ThesisFilterBar({
	currentFilters,
	onFilterChange,
}: Props) {
	return (
		<Row gutter={[16, 16]} className="mb-4">
			<Col xs={24} md={12}>
				<Input
					placeholder="Search thesis by name..."
					prefix={<SearchOutlined />}
					allowClear
					value={currentFilters.englishName ?? ''}
					onChange={(e) =>
						onFilterChange({
							englishName: e.target.value.trim() || undefined,
						})
					}
				/>
			</Col>

			<Col xs={24} md={12}>
				<Select
					placeholder="Filter by Public Access"
					allowClear
					style={{ width: '100%' }}
					value={currentFilters.isPublish}
					onChange={(value) =>
						onFilterChange({
							isPublish: value ?? undefined,
						})
					}
				>
					<Select.Option value={true}>Published</Select.Option>
					<Select.Option value={false}>Unpublished</Select.Option>
				</Select>
			</Col>
		</Row>
	);
}
