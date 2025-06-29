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

	return (
		<Card>
			<Title level={4}>{groupName}</Title>

			<Paragraph>
				<Text strong>Project Area:</Text> {projectArea}
			</Paragraph>

			<Paragraph>
				<Text strong>Group Description:</Text> {description}
			</Paragraph>

			<Paragraph>
				<Text strong>Selected Thesis Topic:</Text> {selectedThesis}
			</Paragraph>
		</Card>
	);
}
