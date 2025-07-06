'use client';

import { Input, Space } from 'antd';

import { FormLabel } from '@/components/common/FormLabel';

interface Props {
	name: string;
	description: string;
	onNameChange: (val: string) => void;
	onDescriptionChange: (val: string) => void;
	showErrors?: boolean;
}

export default function ChecklistGeneral({
	name,
	description,
	onNameChange,
	onDescriptionChange,
	showErrors = false,
}: Readonly<Props>) {
	return (
		<Space direction="vertical" size="middle" style={{ width: '100%' }}>
			<div>
				<FormLabel text="Checklist Name" isRequired />
				<Input
					placeholder="Enter checklist name"
					value={name}
					onChange={(e) => onNameChange(e.target.value)}
					status={showErrors && !name.trim() ? 'error' : undefined}
				/>
			</div>

			<div>
				<FormLabel text="Checklist Description" isRequired />
				<Input.TextArea
					placeholder="Enter checklist description"
					value={description}
					onChange={(e) => onDescriptionChange(e.target.value)}
					autoSize={{ minRows: 2 }}
					status={showErrors && !description.trim() ? 'error' : undefined}
				/>
			</div>
		</Space>
	);
}
