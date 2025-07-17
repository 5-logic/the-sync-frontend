'use client';

import { SearchOutlined } from '@ant-design/icons';
import { Button, Col, Input, Row } from 'antd';

import SemesterMilestoneSelect from '@/components/features/lecturer/AssignLecturerReview/SemesterMilestoneSelect';

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
			<SemesterMilestoneSelect
				semester={semester}
				onSemesterChange={onSemesterChange}
				milestone={milestone}
				onMilestoneChange={onMilestoneChange}
			/>

			<Col flex="auto">
				<Input
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
					placeholder="Search group or thesis"
					prefix={<SearchOutlined style={{ color: '#aaa' }} />}
					style={{ width: '100%' }}
					size="middle"
				/>
			</Col>

			<Col>
				<Button type="primary">Assign Reviewer</Button>
			</Col>
		</Row>
	);
}
