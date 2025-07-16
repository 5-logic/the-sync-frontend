'use client';

import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, Input, Row, Select } from 'antd';

const { Option } = Select;

type Props = Readonly<{
	search: string;
	onSearchChange: (val: string) => void;
	major: string;
	onMajorChange: (val: string) => void;
	majorOptions: string[];
	majorNamesMap?: Record<string, string>;
	onRefresh?: () => void;
	loading?: boolean;
}>;

export default function StudentFilterBar({
	search,
	onSearchChange,
	major,
	onMajorChange,
	majorOptions,
	majorNamesMap = {},
	onRefresh,
	loading = false,
}: Props) {
	return (
		<Row gutter={[12, 12]} wrap align="middle" justify="start">
			<Col flex="auto">
				<Input
					allowClear
					prefix={<SearchOutlined />}
					placeholder="Search students by name or email"
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
				/>
			</Col>

			<Col style={{ width: 160 }}>
				<Select
					value={major}
					onChange={onMajorChange}
					style={{ width: '100%' }}
				>
					<Option value="All">All Majors</Option>
					{majorOptions
						.filter((opt) => opt !== 'All')
						.map((opt) => (
							<Option key={opt} value={opt}>
								{majorNamesMap[opt] || opt}
							</Option>
						))}
				</Select>
			</Col>

			{onRefresh && (
				<Col flex="none">
					<Button
						icon={<ReloadOutlined />}
						onClick={onRefresh}
						loading={loading}
						type="default"
					>
						Refresh
					</Button>
				</Col>
			)}
		</Row>
	);
}
