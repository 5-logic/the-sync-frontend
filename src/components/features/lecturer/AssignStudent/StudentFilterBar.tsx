'use client';

import { SearchOutlined } from '@ant-design/icons';
import { Col, Input, Row, Select } from 'antd';

const { Option } = Select;

type Props = Readonly<{
	search: string;
	onSearchChange: (val: string) => void;
	major: string;
	onMajorChange: (val: string) => void;
	status: string;
	onStatusChange: (val: string) => void;
	majorOptions: string[];
}>;

export default function StudentFilterBar({
	search,
	onSearchChange,
	major,
	onMajorChange,
	status,
	onStatusChange,
	majorOptions,
}: Props) {
	return (
		<Row
			gutter={[12, 12]}
			wrap
			align="middle"
			justify="start"
			style={{ marginBottom: 16 }}
		>
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
					{majorOptions.map((opt) => (
						<Option key={opt} value={opt}>
							{opt}
						</Option>
					))}
				</Select>
			</Col>

			<Col style={{ width: 160 }}>
				<Select
					value={status}
					onChange={onStatusChange}
					style={{ width: '100%' }}
				>
					<Option value="All">All Status</Option>
					<Option value="In Group">In Group</Option>
					<Option value="No Group">No Group</Option>
				</Select>
			</Col>
		</Row>
	);
}
