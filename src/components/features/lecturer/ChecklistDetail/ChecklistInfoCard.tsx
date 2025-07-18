'use client';

import { Card, Form, Input, Select, Typography } from 'antd';

import { FormLabel } from '@/components/common/FormLabel';

interface Props {
	name: string;
	description?: string;
	milestone?: string;
	milestoneId?: string;
	editable?: boolean;
	loading?: boolean;
	availableMilestones?: Array<{ id: string; name: string }>;
	onNameChange?: (val: string) => void;
	onDescriptionChange?: (val: string) => void;
	onMilestoneChange?: (val: string) => void;
	showErrors?: boolean;
}

interface EditableFormProps {
	name: string;
	description?: string;
	milestoneId?: string;
	loading: boolean;
	availableMilestones: Array<{ id: string; name: string }>;
	showErrors: boolean;
	onNameChange?: (val: string) => void;
	onDescriptionChange?: (val: string) => void;
	onMilestoneChange?: (val: string) => void;
}

function EditableForm({
	name,
	description,
	milestoneId,
	loading,
	availableMilestones,
	showErrors,
	onNameChange,
	onDescriptionChange,
	onMilestoneChange,
}: EditableFormProps) {
	const nameError = showErrors && !name.trim();
	const descriptionError = showErrors && !description?.trim();
	const milestoneError = showErrors && !milestoneId;

	return (
		<>
			<Form.Item
				style={{ width: '100%', marginBottom: 16 }}
				validateStatus={nameError ? 'error' : ''}
				help={nameError ? 'Checklist name is required' : ''}
			>
				<FormLabel text="Checklist Name" isBold />
				<Input
					value={name}
					onChange={(e) => onNameChange?.(e.target.value)}
					placeholder="Enter checklist name"
					disabled={loading}
				/>
			</Form.Item>

			<Form.Item
				style={{ width: '100%', marginBottom: 16 }}
				validateStatus={descriptionError ? 'error' : ''}
				help={descriptionError ? 'Description is required' : ''}
			>
				<FormLabel text="Description" isBold />
				<Input.TextArea
					value={description}
					onChange={(e) => onDescriptionChange?.(e.target.value)}
					placeholder="Enter checklist description"
					autoSize={{ minRows: 2 }}
					style={{ resize: 'none' }}
					disabled={loading}
				/>
			</Form.Item>

			<Form.Item
				style={{ width: '100%', marginBottom: 16 }}
				validateStatus={milestoneError ? 'error' : ''}
				help={milestoneError ? 'Milestone is required' : ''}
			>
				<FormLabel text="Milestone" isBold />
				<Select
					value={milestoneId}
					onChange={onMilestoneChange}
					placeholder="Select milestone"
					disabled={loading}
					style={{ width: '100%' }}
				>
					{availableMilestones.map((milestone) => (
						<Select.Option key={milestone.id} value={milestone.id}>
							{milestone.name}
						</Select.Option>
					))}
				</Select>
			</Form.Item>
		</>
	);
}

interface ReadOnlyViewProps {
	name: string;
	description?: string;
}

function ReadOnlyView({ name, description }: ReadOnlyViewProps) {
	return (
		<>
			<Typography.Title level={5} style={{ marginBottom: 0 }}>
				Checklist Name: {name}
			</Typography.Title>

			{description && (
				<Typography.Paragraph>
					<strong>Description:</strong> {description}
				</Typography.Paragraph>
			)}
		</>
	);
}

export default function ChecklistInfoCard({
	name,
	description,
	milestone,
	milestoneId,
	editable = false,
	loading = false,
	availableMilestones = [],
	onNameChange,
	onDescriptionChange,
	onMilestoneChange,
	showErrors = false,
}: Readonly<Props>) {
	return (
		<Card title="Checklist Information">
			{editable ? (
				<EditableForm
					name={name}
					description={description}
					milestoneId={milestoneId}
					loading={loading}
					availableMilestones={availableMilestones}
					showErrors={showErrors}
					onNameChange={onNameChange}
					onDescriptionChange={onDescriptionChange}
					onMilestoneChange={onMilestoneChange}
				/>
			) : (
				<ReadOnlyView name={name} description={description} />
			)}

			<Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
				<b>Milestone:</b> {milestone || 'No milestone assigned'}
			</Typography.Paragraph>
		</Card>
	);
}
