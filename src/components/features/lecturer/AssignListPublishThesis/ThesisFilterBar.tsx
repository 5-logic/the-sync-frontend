'use client';

import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, Input, Row, Select } from 'antd';

interface Filters {
	readonly searchText?: string;
	readonly isPublish?: boolean;
	readonly domain?: string;
	readonly semesterId?: string;
}

interface Props {
	readonly currentFilters: Filters;
	readonly onFilterChange: (filters: Partial<Filters>) => void;
	readonly domainOptions: string[];
	readonly semesterOptions: Array<{ id: string; name: string; code: string }>;
	readonly onRefresh?: () => void;
	readonly loading?: boolean;
}

export default function ThesisFilterBar({
	currentFilters,
	onFilterChange,
	onRefresh,
	loading = false,
	semesterOptions,
}: Readonly<Props>) {
	const handleNameChange = (value: string) => {
		onFilterChange({
			searchText: value.trim() || undefined,
		});
	};

	const handlePublishChange = (value: boolean | undefined) => {
		onFilterChange({
			isPublish: value,
		});
	};

	const handleSemesterChange = (value: string | undefined) => {
		onFilterChange({
			semesterId: value,
		});
	};

	const isPublishValue =
		typeof currentFilters.isPublish === 'boolean'
			? currentFilters.isPublish
			: undefined;

	return (
		<Row gutter={[16, 16]} className="mb-4">
			<Col xs={24} md={12}>
				<Input
					placeholder="Search by thesis name or lecturer name..."
					prefix={<SearchOutlined />}
					allowClear
					style={{ width: '100%' }}
					value={currentFilters.searchText ?? ''}
					onChange={(e) => handleNameChange(e.target.value)}
				/>
			</Col>

			<Col xs={12} md={4}>
				<Select
					placeholder="Filter by Semester"
					allowClear
					style={{ width: '100%' }}
					value={currentFilters.semesterId}
					onChange={(value) => handleSemesterChange(value)}
				>
					{semesterOptions.map((semester) => (
						<Select.Option key={semester.id} value={semester.id}>
							{semester.name}
						</Select.Option>
					))}
				</Select>
			</Col>

			<Col xs={12} md={4}>
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

			<Col xs={24} md={4}>
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
