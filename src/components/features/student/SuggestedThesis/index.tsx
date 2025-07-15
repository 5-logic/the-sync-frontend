'use client';

import { Col, Row, Typography } from 'antd';
import { useState } from 'react';

import ChatBox from '@/components/features/student/SuggestedThesis/ChatBox';
import TopicCard from '@/components/features/student/SuggestedThesis/TopicCard';
import { mockTopics } from '@/data/mockTopics';

const { Title } = Typography;

export default function ThesisPage() {
	const [selectedTopic, setSelectedTopic] = useState<
		(typeof mockTopics)[number] | null
	>(null);

	return (
		<div style={{ padding: 24 }}>
			<Title level={3}>AI-Suggested Thesis Topics</Title>
			<Row gutter={[16, 16]}>
				{mockTopics.map((topic) => (
					<Col xs={24} md={12} lg={8} key={topic.id}>
						<TopicCard
							topic={topic}
							onSelect={() => setSelectedTopic(topic)}
							isSelected={selectedTopic?.id === topic.id}
						/>
					</Col>
				))}
			</Row>

			<div style={{ marginTop: 48 }}>
				<ChatBox selectedTopic={selectedTopic} />
			</div>
		</div>
	);
}
