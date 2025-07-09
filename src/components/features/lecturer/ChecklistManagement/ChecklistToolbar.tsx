'use client';

import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, Input, Row } from 'antd';
import { useState } from 'react';

import SemesterMilestoneSelect from '@/components/features/lecturer/AssignLecturerReview/SemesterMilestoneSelect';

interface Props {
	readonly onSearchChange: (val: string) => void;
	readonly semester: string;
	readonly onSemesterChange: (val: string) => void;
	readonly milestone: string;
	readonly onMilestoneChange: (val: string) => void;
	readonly onCreate?: () => void;
	readonly buttonLabel?: string;
	readonly hideButton?: boolean;
	readonly disabledSemester?: boolean;
	readonly disabledMilestone?: boolean;
}

export default function ChecklistToolbar({
	onSearchChange,
	semester,
	onSemesterChange,
	milestone,
	onMilestoneChange,
	onCreate,
	buttonLabel = 'Create New Checklist',
	hideButton = false,
	disabledSemester = false,
	disabledMilestone = false,
}: Props) {
	const [searchValue, setSearchValue] = useState('');

	const handleSearchChange = (value: string) => {
		setSearchValue(value);
		onSearchChange(value);
	};

	return (
		<Row
			gutter={[12, 12]}
			wrap
			align="middle"
			justify="space-between"
			style={{ marginBottom: 16 }}
		>
			{/* Search input */}
			<Col flex="auto">
				<Input
					allowClear
					prefix={<SearchOutlined />}
					placeholder="Search checklist name"
					value={searchValue}
					onChange={(e) => handleSearchChange(e.target.value)}
				/>
			</Col>

			{/* Semester & Milestone filter */}
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

			{/* Create button */}
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
