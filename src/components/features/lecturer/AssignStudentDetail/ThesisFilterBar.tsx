'use client';

import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, Input, Row, Select } from 'antd';

interface Props {
	readonly search: string;
	readonly onSearchChange: (value: string) => void;
	readonly semester: string;
	readonly onSemesterChange: (value: string) => void;
	readonly semesterOptions: string[];
	readonly semesterNamesMap: Record<string, string>;
	readonly onRefresh: () => void;
	readonly loading?: boolean;
}

export default function ThesisFilterBar({
	search,
	onSearchChange,
	semester,
	onSemesterChange,
	semesterOptions,
	semesterNamesMap,
	onRefresh,
	loading = false,
}: Props) {
	return (
		<Row gutter={[16, 16]} align="middle">
			<Col xs={24} sm={17} md={17} lg={17} xl={17}>
				<Input
					placeholder="Search by thesis name or abbreviation..."
					prefix={<SearchOutlined />}
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
					allowClear
				/>
			</Col>
			<Col xs={24} sm={4} md={4} lg={4} xl={4}>
				<Select
					placeholder="Semester"
					value={semester}
					onChange={onSemesterChange}
					style={{ width: '100%' }}
					allowClear
				>
					{semesterOptions.map((option) => (
						<Select.Option key={option} value={option}>
							{semesterNamesMap[option]}
						</Select.Option>
					))}
				</Select>
			</Col>
			<Col xs={24} sm={3} md={3} lg={3} xl={3}>
				<Button
					icon={<ReloadOutlined />}
					onClick={onRefresh}
					loading={loading}
					title="Refresh data"
					style={{ width: '100%' }}
				>
					Refresh
				</Button>
			</Col>
		</Row>
	);
}
