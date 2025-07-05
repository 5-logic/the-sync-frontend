import { Card, Typography } from 'antd';

interface Props {
	name: string;
	description?: string;
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
			<Typography.Title level={5} style={{ marginBottom: 12 }}>
				Checklist Name: {name}
			</Typography.Title>

			{description && (
				<Typography.Paragraph>
					<strong>Description:</strong> {description}
				</Typography.Paragraph>
			)}

			<Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
				<b>Semester:</b> {semester} &nbsp;&nbsp;|&nbsp;&nbsp;
				<b>Milestone:</b> {milestone}
			</Typography.Paragraph>
		</Card>
	);
}
