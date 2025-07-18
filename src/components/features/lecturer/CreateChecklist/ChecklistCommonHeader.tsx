'use client';

import { Card, Input, Select, Space, Typography } from 'antd';

import { FormLabel } from '@/components/common/FormLabel';

interface Props {
	milestone: string;
	checklistName: string;
	checklistDescription: string;
	onNameChange: (val: string) => void;
	onDescriptionChange: (val: string) => void;
	onMilestoneChange: (val: string) => void;
	availableMilestones: { label: string; value: string }[];
	showErrors: boolean;
	loading?: boolean;
}

export default function ChecklistCommonHeader({
	milestone,
	checklistName,
	checklistDescription,
	onNameChange,
	onDescriptionChange,
	onMilestoneChange,
	availableMilestones,
	showErrors,
	loading = false,
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
							availableMilestones.find((m) => m.value === milestone)?.value ??
							undefined
						}
						onChange={onMilestoneChange}
						options={availableMilestones}
						style={{ minWidth: 200 }}
						placeholder="Select milestone"
						disabled={loading}
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
							disabled={loading}
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
							disabled={loading}
						/>
					</div>
				</Space>
			</Card>
		</Space>
	);
}
