// components/TopicCard.tsx
import { CheckCircleOutlined } from '@ant-design/icons';
import { Card, Progress, Tag } from 'antd';
import React from 'react';

interface Topic {
	id: number;
	title: string;
	description: string;
	tags: string[];
	confidence: number;
}

interface TopicCardProps {
	topic: Topic;
	onSelect: () => void;
	isSelected: boolean;
}

const TopicCard: React.FC<TopicCardProps> = ({
	topic,
	onSelect,
	isSelected,
}) => {
	return (
		<Card
			onClick={onSelect}
			hoverable
			style={{ borderColor: isSelected ? '#1890ff' : undefined }}
			title={
				<div style={{ display: 'flex', justifyContent: 'space-between' }}>
					<span>{topic.title}</span>
					{isSelected && <CheckCircleOutlined style={{ color: '#1890ff' }} />}
				</div>
			}
		>
			<p>{topic.description}</p>
			<div style={{ marginBottom: 8 }}>
				{topic.tags.map((tag) => (
					<Tag key={tag}>{tag}</Tag>
				))}
			</div>
			<Progress
				percent={topic.confidence}
				showInfo={false}
				strokeColor="#52c41a"
			/>
			<small>AI Confidence: {topic.confidence}%</small>
		</Card>
	);
};

export default TopicCard;
