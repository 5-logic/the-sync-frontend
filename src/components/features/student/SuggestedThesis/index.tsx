'use client';

import { Col, Row, Space } from 'antd';
import { useState } from 'react';

import { Header } from '@/components/common/Header';
import ChatBox from '@/components/features/student/SuggestedThesis/ChatBox';
import TopicCard from '@/components/features/student/SuggestedThesis/TopicCard';
import { mockTopics } from '@/data/mockTopics';

export default function ThesisPage() {
	const [selectedTopic, setSelectedTopic] = useState<
		(typeof mockTopics)[number] | null
	>(null);

	return (
		<Space
			direction="vertical"
			style={{ padding: 24, width: '100%' }}
			size="large"
		>
			<Header
				title="AI-Suggested Thesis Topics"
				description="AI-recommended thesis topics based on your profile."
			/>
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
		</Space>
	);
}
