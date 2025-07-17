'use client';

import { Col, Row, Select } from 'antd';
import { useEffect } from 'react';

import { useSemesterStore } from '@/store/useSemesterStore';

const { Option } = Select;

interface Props {
	semester: string;
	onSemesterChange: (val: string) => void;
	milestone: string;
	onMilestoneChange: (val: string) => void;
	disabledSemester?: boolean;
	disabledMilestone?: boolean;
}

export default function SemesterMilestoneSelect({
	semester,
	onSemesterChange,
	milestone,
	onMilestoneChange,
	disabledSemester = false,
	disabledMilestone = false,
}: Readonly<Props>) {
	const { semesters, fetchSemesters, loading } = useSemesterStore();

	useEffect(() => {
		fetchSemesters();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Row gutter={[12, 12]} wrap>
			<Col style={{ width: 160 }}>
				<Select
					value={semester}
					onChange={onSemesterChange}
					placeholder="Select Semester"
					style={{ width: '100%' }}
					size="middle"
					disabled={disabledSemester || loading}
					loading={loading}
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
					disabled={disabledMilestone}
				>
					<Option value="">All Milestones</Option>
					<Option value="Review 1">Review 1</Option>
					<Option value="Review 2">Review 2</Option>
					<Option value="Review 3">Review 3</Option>
					<Option value="Final Review">Final Review</Option>
				</Select>
			</Col>
		</Row>
	);
}
