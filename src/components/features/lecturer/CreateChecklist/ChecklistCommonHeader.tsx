'use client';

import { Card, Space } from 'antd';

import ChecklistContextTitle from './ChecklistContextTitle';
import ChecklistGeneral from './ChecklistGeneral';

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
			<ChecklistContextTitle
				semester={semester}
				milestone={milestone}
				fontSize={16}
			/>

			<Card title="Checklist Info">
				<ChecklistGeneral
					name={checklistName}
					description={checklistDescription}
					onNameChange={onNameChange}
					onDescriptionChange={onDescriptionChange}
					showErrors={showErrors}
				/>
			</Card>
		</Space>
	);
}
