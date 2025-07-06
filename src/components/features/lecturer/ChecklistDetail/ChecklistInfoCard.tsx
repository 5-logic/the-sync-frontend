'use client';

import { Card, Form, Input, Typography } from 'antd';

import { FormLabel } from '@/components/common/FormLabel';

interface Props {
	name: string;
	description?: string;
	semester: string;
	milestone: string;
	editable?: boolean;
	onNameChange?: (val: string) => void;
	onDescriptionChange?: (val: string) => void;
	showErrors?: boolean;
}

export default function ChecklistInfoCard({
	name,
	description,
	semester,
	milestone,
	editable = false,
	onNameChange,
	onDescriptionChange,
	showErrors = false,
}: Readonly<Props>) {
	const nameError = showErrors && !name.trim();
	const descriptionError = showErrors && !description?.trim();

	return (
		<Card title="Checklist Information">
			{editable ? (
				<>
					<Form.Item
						label={<FormLabel text="Checklist Name" isBold />}
						validateStatus={nameError ? 'error' : ''}
						help={nameError ? 'Checklist name is required' : ''}
						style={{ width: '100%', marginBottom: 16 }}
					>
						<Input
							value={name}
							onChange={(e) => onNameChange?.(e.target.value)}
							placeholder="Enter checklist name"
						/>
					</Form.Item>

					<Form.Item
						label={<FormLabel text="Description" isBold />}
						validateStatus={descriptionError ? 'error' : ''}
						help={descriptionError ? 'Description is required' : ''}
					>
						<Input.TextArea
							value={description}
							onChange={(e) => onDescriptionChange?.(e.target.value)}
							placeholder="Enter checklist description"
							autoSize={{ minRows: 1, maxRows: 1 }}
							style={{ resize: 'none' }}
						/>
					</Form.Item>
				</>
			) : (
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
			)}

			<Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
				<b>Semester:</b> {semester} &nbsp;&nbsp;|&nbsp;&nbsp;
				<b>Milestone:</b> {milestone}
			</Typography.Paragraph>
		</Card>
	);
}
