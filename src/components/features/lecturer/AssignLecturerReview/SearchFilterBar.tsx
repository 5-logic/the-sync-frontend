'use client';

import { SearchOutlined } from '@ant-design/icons';
import { Col, Input, Row, Select } from 'antd';

const { Option } = Select;

interface Props {
	search: string;
	onSearchChange: (val: string) => void;
	semester: string;
	onSemesterChange: (val: string) => void;
	milestone: string;
	onMilestoneChange: (val: string) => void;
}

export default function SearchFilterBar({
	search,
	onSearchChange,
	semester,
	onSemesterChange,
	milestone,
	onMilestoneChange,
}: Readonly<Props>) {
	return (
		<Row
			gutter={[12, 12]}
			wrap
			align="middle"
			justify="start"
			style={{ marginBottom: 10 }}
		>
			<Col style={{ width: 160 }}>
				<Select
					value={semester}
					onChange={onSemesterChange}
					placeholder="Select Semester"
					style={{ width: '100%' }}
					size="middle"
				>
					<Option value="">All Semesters</Option>
					<Option value="20251">Spring 2025</Option>
					<Option value="20252">Summer 2025</Option>
				</Select>
			</Col>

			<Col style={{ width: 160 }}>
				<Select
					value={milestone}
					onChange={onMilestoneChange}
					placeholder="Select Milestone"
					style={{ width: '100%' }}
					size="middle"
				>
					<Option value="Review 1">Review 1</Option>
					<Option value="Review 2">Review 2</Option>
					<Option value="Review 3">Review 3</Option>
					<Option value="Final Review">Final Review</Option>
				</Select>
			</Col>

			<Col flex="auto">
				<Input
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
					placeholder="Search groups"
					prefix={<SearchOutlined style={{ color: '#aaa' }} />}
					style={{ width: '100%' }}
					size="middle"
				/>
			</Col>
		</Row>
	);
}
