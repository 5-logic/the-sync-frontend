'use client';

import { SearchOutlined } from '@ant-design/icons';
import { Button, Col, Input, Row } from 'antd';

import SemesterMilestoneSelect from '@/components/features/lecturer/AssignLecturerReview/SemesterMilestoneSelect';
import { Milestone } from '@/schemas/milestone';
import { Semester } from '@/schemas/semester';

interface Props {
	search: string;
	onSearchChange: (val: string) => void;
	semester: string;
	onSemesterChange: (val: string) => void;
	milestone: string;
	onMilestoneChange: (val: string) => void;
	semesters: Semester[];
	milestones: Milestone[];
	loadingSemesters?: boolean;
	loadingMilestones?: boolean;
	noMilestone?: boolean;
}

export default function SearchFilterBar(props: Readonly<Props>) {
	const {
		search,
		onSearchChange,
		semester,
		onSemesterChange,
		milestone,
		onMilestoneChange,
		semesters,
		milestones,
		loadingSemesters,
		loadingMilestones,
		noMilestone,
	} = props;
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
				milestone={noMilestone ? 'No Milestone' : (milestone ?? '')}
				onMilestoneChange={onMilestoneChange}
				semesters={semesters}
				milestones={milestones}
				loadingSemesters={loadingSemesters}
				loadingMilestones={loadingMilestones}
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
