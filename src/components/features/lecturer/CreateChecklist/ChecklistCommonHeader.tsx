'use client';

import { Card, Input, Select, Space, Typography } from 'antd';

import { FormLabel } from '@/components/common/FormLabel';

interface Props {
	semester: string;
	milestone: string;
	checklistName: string;
	checklistDescription: string;
	onNameChange: (val: string) => void;
	onDescriptionChange: (val: string) => void;
	onSemesterChange: (val: string) => void;
	onMilestoneChange: (val: string) => void;
	availableSemesters: { label: string; value: string }[];
	availableMilestones: { label: string; value: string }[];
	showErrors: boolean;
}

export default function ChecklistCommonHeader({
	semester,
	milestone,
	checklistName,
	checklistDescription,
	onNameChange,
	onDescriptionChange,
	onSemesterChange,
	onMilestoneChange,
	availableSemesters,
	availableMilestones,
	showErrors,
}: Readonly<Props>) {
	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			{/* Context title */}
			<div>
				<Typography.Text strong style={{ fontSize: 16 }}>
					Create checklist for {'  '}
				</Typography.Text>

				<Space size="middle" wrap>
					<Select
						value={
							availableSemesters.find((s) => s.value === semester)?.value ??
							undefined
						}
						onChange={onSemesterChange}
						options={availableSemesters}
						style={{ minWidth: 160 }}
						placeholder="Select semester"
					/>

					<Select
						value={
							availableMilestones.find((m) => m.value === milestone)?.value ??
							undefined
						}
						onChange={onMilestoneChange}
						options={availableMilestones}
						style={{ minWidth: 200 }}
						placeholder="Select milestone"
					/>
				</Space>
			</div>

			{/* Checklist general info form */}
			<Card title="Checklist Info">
				<Space direction="vertical" size="middle" style={{ width: '100%' }}>
					<div>
						<FormLabel text="Checklist Name" isRequired />
						<Input
							placeholder="Enter checklist name"
							value={checklistName}
							onChange={(e) => onNameChange(e.target.value)}
							status={showErrors && !checklistName.trim() ? 'error' : undefined}
						/>
					</div>

					<div>
						<FormLabel text="Checklist Description" isRequired />
						<Input.TextArea
							placeholder="Enter checklist description"
							value={checklistDescription}
							onChange={(e) => onDescriptionChange(e.target.value)}
							autoSize={{ minRows: 2 }}
							status={
								showErrors && !checklistDescription.trim() ? 'error' : undefined
							}
						/>
					</div>
				</Space>
			</Card>
		</Space>
	);
}
