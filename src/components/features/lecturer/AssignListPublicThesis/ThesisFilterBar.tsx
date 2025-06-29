'use client';

import { Col, Input, Row, Select } from 'antd';

interface Filters {
	englishName?: string;
	domain?: string;
	group?: string;
	semester?: string;
}

interface Props {
	domains: string[];
	groups: { id: string; name: string }[];
	onFilterChange: (filters: Filters) => void;
	currentFilters: Filters;
}

export default function ThesisFilterBar({
	domains,
	groups,
	onFilterChange,
	currentFilters,
}: Props) {
	return (
		<Row gutter={[16, 16]} className="mb-4">
			<Col xs={24} md={6}>
				<Input
					placeholder="Search thesis by name..."
					allowClear
					value={currentFilters.englishName ?? ''}
					onChange={(e) =>
						onFilterChange({
							englishName: e.target.value.trim() || undefined,
						})
					}
				/>
			</Col>

			<Col xs={24} md={6}>
				<Select
					placeholder="Select Domain"
					allowClear
					style={{ width: '100%' }}
					value={currentFilters.domain}
					onChange={(value) => onFilterChange({ domain: value ?? undefined })}
				>
					{domains.map((domain) => (
						<Select.Option key={domain} value={domain}>
							{domain}
						</Select.Option>
					))}
				</Select>
			</Col>

			<Col xs={24} md={6}>
				<Select
					placeholder="Select Group"
					allowClear
					style={{ width: '100%' }}
					value={currentFilters.group}
					onChange={(value) => onFilterChange({ group: value ?? undefined })}
				>
					{groups.map((group) => (
						<Select.Option key={group.id} value={group.id}>
							{group.name}
						</Select.Option>
					))}
				</Select>
			</Col>

			<Col xs={24} md={6}>
				<Select
					placeholder="Select Semester"
					allowClear
					style={{ width: '100%' }}
					value={currentFilters.semester}
					onChange={(value) => onFilterChange({ semester: value ?? undefined })}
				>
					<Select.Option value="Spring">Spring</Select.Option>
					<Select.Option value="Fall">Fall</Select.Option>
				</Select>
			</Col>
		</Row>
	);
}
