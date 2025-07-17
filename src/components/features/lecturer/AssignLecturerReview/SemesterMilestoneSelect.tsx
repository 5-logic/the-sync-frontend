'use client';

import { Col, Row, Select } from 'antd';

import { Milestone } from '@/schemas/milestone';
import { Semester } from '@/schemas/semester';

const { Option } = Select;

interface Props {
	semester: string;
	onSemesterChange: (val: string) => void;
	milestone: string;
	onMilestoneChange: (val: string) => void;
	semesters: Semester[];
	milestones: Milestone[];
	loadingSemesters?: boolean;
	loadingMilestones?: boolean;
	disabledSemester?: boolean;
	disabledMilestone?: boolean;
}

export default function SemesterMilestoneSelect({
	semester,
	onSemesterChange,
	milestone,
	onMilestoneChange,
	semesters,
	milestones,
	loadingSemesters = false,
	loadingMilestones = false,
	disabledSemester = false,
	disabledMilestone = false,
}: Readonly<Props>) {
	return (
		<Row gutter={[12, 12]} wrap>
			<Col style={{ width: 160 }}>
				<Select
					value={semester}
					onChange={onSemesterChange}
					placeholder="Select Semester"
					style={{ width: '100%' }}
					size="middle"
					disabled={disabledSemester || loadingSemesters}
					loading={loadingSemesters}
				>
					<Option value="">All Semesters</Option>
					{semesters.map((s) => (
						<Option key={s.id} value={s.id}>
							{s.name}
						</Option>
					))}
				</Select>
			</Col>

			<Col style={{ width: 160 }}>
				<Select
					value={milestone}
					onChange={onMilestoneChange}
					placeholder="Select Milestone"
					style={{ width: '100%' }}
					size="middle"
					disabled={disabledMilestone || loadingMilestones}
					loading={loadingMilestones}
				>
					<Option value="">All Milestones</Option>
					{milestones.map((m) => (
						<Option key={m.id} value={m.id}>
							{m.name}
						</Option>
					))}
				</Select>
			</Col>
		</Row>
	);
}
