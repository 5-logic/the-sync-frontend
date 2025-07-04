'use client';

import { PlusOutlined } from '@ant-design/icons';
import { Button, Col, Row, Select } from 'antd';

import { mockSemesters } from '@/data/semester';

const { Option } = Select;

interface Props {
	semester: string;
	onSemesterChange: (val: string) => void;
	milestone: string;
	onMilestoneChange: (val: string) => void;
	onCreate?: () => void;
	buttonLabel?: string;
	hideButton?: boolean;
}

export default function ChecklistToolbar({
	semester,
	onSemesterChange,
	milestone,
	onMilestoneChange,
	onCreate,
	buttonLabel = 'Create New Checklist',
	hideButton = false,
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
				<Row gutter={[12, 12]} wrap>
					<Col style={{ width: 160 }}>
						<Select
							value={semester}
							onChange={onSemesterChange}
							placeholder="Select Semester"
							style={{ width: '100%' }}
							size="middle"
						>
							<Option value="">All Semesters</Option>
							{mockSemesters.map((s) => (
								<Option key={s.value} value={s.value}>
									{s.label}
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
						>
							<Option value="">All Milestones</Option>
							<Option value="Review 1">Review 1</Option>
							<Option value="Review 2">Review 2</Option>
							<Option value="Review 3">Review 3</Option>
							<Option value="Final Review">Final Review</Option>
						</Select>
					</Col>
				</Row>
			</Col>

			{!hideButton && (
				<Col>
					<Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
						{buttonLabel}
					</Button>
				</Col>
			)}
		</Row>
	);
}
