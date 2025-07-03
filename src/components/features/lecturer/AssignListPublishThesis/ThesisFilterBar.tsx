'use client';

import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, Input, Row, Select } from 'antd';

interface Filters {
	readonly englishName?: string;
	readonly isPublish?: boolean;
	readonly domain?: string;
}

interface Props {
	readonly currentFilters: Filters;
	readonly onFilterChange: (filters: Filters) => void;
	readonly domainOptions: string[];
	readonly onRefresh?: () => void;
	readonly loading?: boolean;
}

export default function ThesisFilterBar({
	currentFilters,
	onFilterChange,
	onRefresh,
	loading = false,
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

	const isPublishValue =
		typeof currentFilters.isPublish === 'boolean'
			? currentFilters.isPublish
			: undefined;

	return (
		<Row gutter={[16, 16]} className="mb-4">
			<Col xs={24} md={16}>
				<Input
					placeholder="Search thesis by name..."
					prefix={<SearchOutlined />}
					allowClear
					style={{ width: '100%' }}
					value={currentFilters.englishName ?? ''}
					onChange={(e) => handleNameChange(e.target.value)}
				/>
			</Col>

			<Col xs={16} md={5}>
				<Select
					placeholder="Filter by Public Access"
					allowClear
					style={{ width: '100%' }}
					value={isPublishValue}
					onChange={(value) => handlePublishChange(value)}
				>
					<Select.Option value={true}>Published</Select.Option>
					<Select.Option value={false}>Unpublished</Select.Option>
				</Select>
			</Col>

			<Col xs={8} md={3}>
				<Button
					icon={<ReloadOutlined />}
					onClick={onRefresh}
					loading={loading}
					style={{ width: '100%' }}
				>
					Refresh
				</Button>
			</Col>
		</Row>
	);
}
