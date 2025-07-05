'use client';

import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, Input, Row } from 'antd';
import { useState } from 'react';

import SemesterMilestoneSelect from '@/components/features/lecturer/AssignLecturerReview/SemesterMilestoneSelect';

interface Props {
	onSearchChange: (val: string) => void;
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
	onSearchChange,
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
	const [searchValue, setSearchValue] = useState('');

	return (
		<Row
			gutter={[12, 12]}
			wrap
			align="middle"
			justify="space-between"
			style={{ marginBottom: 16 }}
		>
			{/* search */}
			<Col flex="auto">
				<Input
					allowClear
					prefix={<SearchOutlined />}
					placeholder="Search checklist name"
					value={searchValue}
					onChange={(e) => {
						setSearchValue(e.target.value);
						onSearchChange(e.target.value);
					}}
				/>
			</Col>

			{/* filter */}
			<Col flex="none" style={{ minWidth: 250 }}>
				<SemesterMilestoneSelect
					semester={semester}
					onSemesterChange={onSemesterChange}
					milestone={milestone}
					onMilestoneChange={onMilestoneChange}
					disabledSemester={disabledSemester}
					disabledMilestone={disabledMilestone}
				/>
			</Col>

			{/* add */}
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
