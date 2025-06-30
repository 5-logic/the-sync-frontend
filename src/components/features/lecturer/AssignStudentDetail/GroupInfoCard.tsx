'use client';

import { Card, Typography } from 'antd';

import { ExtendedThesis } from '@/data/thesis';

const { Title, Paragraph, Text } = Typography;

interface Props {
	thesis: ExtendedThesis;
}

export default function GroupInfoCard({ thesis }: Props) {
	const groupName = thesis.group?.id ?? 'Unnamed Group';
	const projectArea = thesis.domain;
	const description = thesis.description;
	const selectedThesis = thesis.englishName;
	const supervisor = thesis.supervisor;

	return (
		<Card>
			<Title level={3}>Thesis Topic: {selectedThesis}</Title>

			<Paragraph>
				<Text strong>Group Name:</Text> {groupName}
			</Paragraph>

			<Paragraph>
				<Text strong>Project Area:</Text> {projectArea}
			</Paragraph>

			<Paragraph>
				<Text strong>Selected Thesis Topic:</Text> {selectedThesis}
			</Paragraph>

			<Paragraph>
				<Text strong>Thesis Description:</Text> {description}
			</Paragraph>

			{supervisor && (
				<>
					<Paragraph>
						<Text strong>Supervisor Name:</Text> {supervisor.name}
					</Paragraph>
				</>
			)}
		</Card>
	);
}
