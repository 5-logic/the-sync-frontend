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
}

export default function ChecklistInfoCard({
	name,
	description,
	semester,
	milestone,
	editable = false,
	onNameChange,
	onDescriptionChange,
}: Props) {
	return (
		<Card title="Checklist Info">
			{editable ? (
				<>
					<Typography.Text strong>Checklist Name</Typography.Text>
					<Input
						value={name}
						onChange={(e) => onNameChange?.(e.target.value)}
						placeholder="Enter checklist name"
						style={{ marginBottom: 12 }}
					/>
					<Typography.Text strong>Description</Typography.Text>
					<Input.TextArea
						value={description}
						onChange={(e) => onDescriptionChange?.(e.target.value)}
						placeholder="Enter checklist description"
						autoSize={{ minRows: 2, maxRows: 4 }}
						style={{ marginBottom: 12 }}
					/>
				</>
			) : (
				<>
					<Typography.Title level={5} style={{ marginBottom: 12 }}>
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
