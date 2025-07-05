// src/components/features/lecturer/ChecklistDetail/ChecklistInfoCard.tsx
'use client';

import { Card, Typography } from 'antd';

// src/components/features/lecturer/ChecklistDetail/ChecklistInfoCard.tsx

// src/components/features/lecturer/ChecklistDetail/ChecklistInfoCard.tsx

interface Props {
	name: string;
	description: string;
	semester: string;
	milestone: string;
}

export default function ChecklistInfoCard({
	name,
	description,
	semester,
	milestone,
}: Props) {
	return (
		<Card>
			<Typography.Title level={3}>Checklist Name: {name}</Typography.Title>
			<Typography.Paragraph>Description: {description}</Typography.Paragraph>
			<Typography.Paragraph type="secondary">
				<b>Semester:</b> {semester} &nbsp;&nbsp;|&nbsp;&nbsp;
				<b>Milestone:</b> {milestone}
			</Typography.Paragraph>
		</Card>
	);
}
