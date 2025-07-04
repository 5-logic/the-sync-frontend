'use client';

import SemesterMilestoneSelect from '../AssignLecturerReview/SemesterMilestoneSelect';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Col, Row } from 'antd';

interface Props {
	semester: string;
	onSemesterChange: (val: string) => void;
	milestone: string;
	onMilestoneChange: (val: string) => void;
	onCreate?: () => void;
	disabledCreate: boolean;
	buttonLabel?: string;
	hideButton?: boolean;

	disabledSemester?: boolean;
	disabledMilestone?: boolean;
}

export default function ChecklistToolbar({
	semester,
	onSemesterChange,
	milestone,
	onMilestoneChange,
	onCreate,
	disabledCreate,
	buttonLabel = 'Create New Checklist',
	hideButton = false,
	disabledSemester = false,
	disabledMilestone = false,
}: Readonly<Props>) {
	return (
		<Row
			gutter={[12, 12]}
			wrap
			align="middle"
			justify="space-between"
			style={{ marginBottom: 16 }}
		>
			<Col flex="auto">
				<SemesterMilestoneSelect
					semester={semester}
					onSemesterChange={onSemesterChange}
					milestone={milestone}
					onMilestoneChange={onMilestoneChange}
					disabledSemester={disabledSemester}
					disabledMilestone={disabledMilestone}
				/>
			</Col>

			{!hideButton && (
				<Col>
					<Button
						type="primary"
						icon={<PlusOutlined />}
						onClick={onCreate}
						disabled={disabledCreate}
					>
						{buttonLabel}
					</Button>
				</Col>
			)}
		</Row>
	);
}
