'use client';

import { BookOutlined, FlagOutlined } from '@ant-design/icons';
import { Card, Input, Space, Tag, Typography } from 'antd';

import { FormLabel } from '@/components/common/FormLabel';

interface Props {
	semester: string;
	milestone: string;
	checklistName: string;
	checklistDescription: string;
	onNameChange: (val: string) => void;
	onDescriptionChange: (val: string) => void;
	showErrors: boolean;
}

export default function ChecklistCommonHeader({
	semester,
	milestone,
	checklistName,
	checklistDescription,
	onNameChange,
	onDescriptionChange,
	showErrors,
}: Readonly<Props>) {
	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			{/* Context title */}
			<div>
				<Typography.Text strong style={{ fontSize: 16 }}>
					Create checklist for{' '}
					<Tag
						icon={<BookOutlined />}
						color="blue"
						style={{ fontWeight: 600, marginInline: 4 }}
					>
						{semester}
					</Tag>
					<Tag
						icon={<FlagOutlined />}
						color="volcano"
						style={{ fontWeight: 600, marginInline: 4 }}
					>
						{milestone}
					</Tag>
				</Typography.Text>
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
