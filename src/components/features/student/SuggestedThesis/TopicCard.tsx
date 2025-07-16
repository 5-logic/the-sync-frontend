import { CheckCircleOutlined } from '@ant-design/icons';
import { Card, Progress, Tag, Typography } from 'antd';
import React from 'react';

const { Paragraph } = Typography;

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
			style={{
				borderColor: isSelected ? '#1890ff' : undefined,
				minHeight: 260, // đảm bảo chiều cao đồng nhất
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
			}}
			title={
				<div style={{ display: 'flex', justifyContent: 'space-between' }}>
					<span>{topic.title}</span>
					{isSelected && <CheckCircleOutlined style={{ color: '#1890ff' }} />}
				</div>
			}
		>
			<div>
				<Paragraph ellipsis={{ rows: 3, expandable: false }}>
					{topic.description}
				</Paragraph>

				<div style={{ marginBottom: 8 }}>
					{topic.tags.map((tag) => (
						<Tag key={tag}>{tag}</Tag>
					))}
				</div>
			</div>

			<div>
				<Progress
					percent={topic.confidence}
					showInfo={false}
					strokeColor="blue"
				/>
				<small>AI Confidence: {topic.confidence}%</small>
			</div>
		</Card>
	);
};

export default TopicCard;
