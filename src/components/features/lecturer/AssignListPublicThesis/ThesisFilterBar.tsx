'use client';

import { SearchOutlined } from '@ant-design/icons';
import { Col, Input, Row, Select } from 'antd';

interface Filters {
	readonly englishName?: string;
	readonly isPublish?: boolean;
	readonly domain?: string;
}

interface Props {
	readonly currentFilters: Filters;
	readonly onFilterChange: (filters: Filters) => void;
	readonly domainOptions: string[];
}

export default function ThesisFilterBar({
	currentFilters,
	onFilterChange,
	domainOptions,
}: Readonly<Props>) {
	const handleNameChange = (value: string) => {
		onFilterChange({
			...currentFilters,
			englishName: value.trim() || undefined,
		});
	};

	const handlePublishChange = (value: boolean | undefined) => {
		onFilterChange({
			...currentFilters,
			isPublish: value,
		});
	};

	const handleDomainChange = (value: string | undefined) => {
		onFilterChange({
			...currentFilters,
			domain: value,
		});
	};

	return (
		<Row gutter={[16, 16]} className="mb-4">
			<Col xs={24} md={12}>
				<Input
					placeholder="Search thesis by name..."
					prefix={<SearchOutlined />}
					allowClear
					style={{ width: '100%' }}
					value={currentFilters.englishName ?? ''}
					onChange={(e) => handleNameChange(e.target.value)}
				/>
			</Col>

			<Col xs={24} md={6}>
				<Select
					placeholder="Filter by Public Access"
					allowClear
					style={{ width: '100%' }}
					value={
						currentFilters.isPublish === true
							? true
							: currentFilters.isPublish === false
								? false
								: undefined
					}
					onChange={(value) => handlePublishChange(value)}
				>
					<Select.Option value={true}>Published</Select.Option>
					<Select.Option value={false}>Unpublished</Select.Option>
				</Select>
			</Col>

			<Col xs={24} md={6}>
				<Select
					placeholder="Filter by Domain"
					allowClear
					style={{ width: '100%' }}
					value={currentFilters.domain}
					onChange={(value) => handleDomainChange(value)}
					options={domainOptions.map((domain) => ({
						label: domain,
						value: domain,
					}))}
				/>
			</Col>
		</Row>
	);
}
