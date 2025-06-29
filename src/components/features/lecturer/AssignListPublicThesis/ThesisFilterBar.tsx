'use client';

import { Col, Input, Row, Select } from 'antd';

interface Props {
	domains: string[];
	groupIds: string[];
	onFilterChange: (filters: {
		keyword?: string;
		domain?: string;
		group?: string;
		semester?: string;
	}) => void;
	currentFilters: {
		keyword?: string;
		domain?: string;
		group?: string;
		semester?: string;
	};
}

export default function ThesisFilterBar({
	domains,
	groupIds,
	onFilterChange,
	currentFilters,
}: Props) {
	return (
		<Row gutter={[16, 16]} className="mb-4">
			<Col xs={24} md={6}>
				<Input
					placeholder="Search thesis by name..."
					allowClear
					value={currentFilters.keyword}
					onChange={(e) => onFilterChange({ keyword: e.target.value })}
				/>
			</Col>
			<Col xs={24} md={6}>
				<Select
					placeholder="Select Domain"
					allowClear
					style={{ width: '100%' }}
					value={currentFilters.domain || undefined}
					onChange={(value) => onFilterChange({ domain: value })}
				>
					{domains.map((d) => (
						<Select.Option key={d} value={d}>
							{d}
						</Select.Option>
					))}
				</Select>
			</Col>
			<Col xs={24} md={6}>
				<Select
					placeholder="Select Group"
					allowClear
					style={{ width: '100%' }}
					value={currentFilters.group || undefined}
					onChange={(value) => onFilterChange({ group: value })}
				>
					{groupIds.map((g) => (
						<Select.Option key={g} value={g}>
							{g}
						</Select.Option>
					))}
				</Select>
			</Col>
			<Col xs={24} md={6}>
				<Select
					placeholder="Select Semester"
					allowClear
					style={{ width: '100%' }}
					value={currentFilters.semester || undefined}
					onChange={(value) => onFilterChange({ semester: value })}
				>
					<Select.Option value="Spring">Spring</Select.Option>
					<Select.Option value="Fall">Fall</Select.Option>
				</Select>
			</Col>
		</Row>
	);
}
